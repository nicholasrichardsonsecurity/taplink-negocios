import { and, count, eq, gte, lt, sql, sum } from "drizzle-orm";
import { db } from "@/packages/database/client";
import { analyticsEvents, insightRuns, organizationAiSettings } from "@/packages/database/schema";
import { getOrganizationEntitlements } from "@/lib/entitlements";
import { buildDeterministicInsights, InsightReport, InsightSnapshot, safeInsightSnapshot } from "@/lib/insights";

const model = () => process.env.OPENAI_INSIGHTS_MODEL || "gpt-5-mini";

export async function getInsightSnapshot(organizationId: string): Promise<InsightSnapshot> {
  const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  const currentStart = new Date(today); currentStart.setUTCDate(today.getUTCDate() - 6);
  const previousStart = new Date(currentStart); previousStart.setUTCDate(currentStart.getUTCDate() - 7);
  const aggregate = async (start: Date, end?: Date) => {
    const where = and(eq(analyticsEvents.organizationId, organizationId), gte(analyticsEvents.occurredAt, start), end ? lt(analyticsEvents.occurredAt, end) : undefined);
    const [[views], [actions], [visitors]] = await Promise.all([
      db.select({ value: count() }).from(analyticsEvents).where(and(where, eq(analyticsEvents.eventType, "page_view"))),
      db.select({ value: count() }).from(analyticsEvents).where(and(where, eq(analyticsEvents.eventType, "action_click"))),
      db.select({ value: sql<number>`count(distinct ${analyticsEvents.visitorHash})` }).from(analyticsEvents).where(where),
    ]);
    const v = Number(views.value), a = Number(actions.value);
    return { views: v, actions: a, visitors: Number(visitors.value), conversion: v ? Math.round(a / v * 1000) / 10 : 0 };
  };
  const [current, previous, byAction, bySource] = await Promise.all([
    aggregate(currentStart), aggregate(previousStart, currentStart),
    db.select({ label: analyticsEvents.action, value: count() }).from(analyticsEvents).where(and(eq(analyticsEvents.organizationId, organizationId), gte(analyticsEvents.occurredAt, currentStart), eq(analyticsEvents.eventType, "action_click"))).groupBy(analyticsEvents.action).orderBy(sql`count(*) desc`),
    db.select({ label: analyticsEvents.source, value: count() }).from(analyticsEvents).where(and(eq(analyticsEvents.organizationId, organizationId), gte(analyticsEvents.occurredAt, currentStart))).groupBy(analyticsEvents.source).orderBy(sql`count(*) desc`),
  ]);
  return safeInsightSnapshot({ current, previous, byAction: byAction.map(x => ({ label: x.label ?? "Outro", value: Number(x.value) })), bySource: bySource.map(x => ({ label: x.label, value: Number(x.value) })) });
}

export async function getAiSettings(organizationId: string) {
  const [settings] = await db.select().from(organizationAiSettings).where(eq(organizationAiSettings.organizationId, organizationId)).limit(1);
  return settings ?? { organizationId, enabled: false, monthlyRequestLimit: 20, monthlyTokenLimit: 50000, requiresApproval: true };
}

async function monthlyUsage(organizationId: string) {
  const start = new Date(); start.setUTCDate(1); start.setUTCHours(0, 0, 0, 0);
  const [usage] = await db.select({ requests: count(), tokens: sum(sql`${insightRuns.inputTokens} + ${insightRuns.outputTokens}`) }).from(insightRuns).where(and(eq(insightRuns.organizationId, organizationId), eq(insightRuns.provider, "openai"), gte(insightRuns.createdAt, start)));
  return { requests: Number(usage.requests), tokens: Number(usage.tokens ?? 0) };
}

const schema = { type: "object", additionalProperties: false, required: ["headline", "summary", "recommendations"], properties: { headline: { type: "string", maxLength: 100 }, summary: { type: "string", maxLength: 500 }, recommendations: { type: "array", maxItems: 3, items: { type: "object", additionalProperties: false, required: ["title", "detail", "priority"], properties: { title: { type: "string", maxLength: 100 }, detail: { type: "string", maxLength: 300 }, priority: { type: "string", enum: ["high", "medium", "low"] } } } } } };

async function generateWithOpenAi(snapshot: InsightSnapshot): Promise<{ report: InsightReport; inputTokens: number; outputTokens: number }> {
  const response = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: model(), max_output_tokens: 700, input: [{ role: "system", content: "Você analisa apenas métricas agregadas de uma página comercial. Escreva em português do Brasil, não invente causas ou números e proponha ações proporcionais à evidência." }, { role: "user", content: JSON.stringify(snapshot) }], text: { format: { type: "json_schema", name: "business_insights", strict: true, schema } } }) });
  if (!response.ok) throw new Error(`OPENAI_HTTP_${response.status}`);
  const data = await response.json() as { output_text?: string; output?: { content?: { text?: string }[] }[]; usage?: { input_tokens?: number; output_tokens?: number } };
  const raw = data.output_text ?? data.output?.flatMap(x => x.content ?? []).find(x => x.text)?.text;
  if (!raw) throw new Error("OPENAI_EMPTY_OUTPUT");
  return { report: JSON.parse(raw) as InsightReport, inputTokens: data.usage?.input_tokens ?? 0, outputTokens: data.usage?.output_tokens ?? 0 };
}

export async function createInsightRun(organizationId: string, userId: string) {
  const snapshot = await getInsightSnapshot(organizationId);
  const fallback = buildDeterministicInsights(snapshot);
  const settings = await getAiSettings(organizationId);
  const usage = await monthlyUsage(organizationId);
  let report = fallback, status: "generated" | "fallback" = "fallback", provider = "rules", inputTokens = 0, outputTokens = 0, errorCode: string | null = null;
  const entitlements = await getOrganizationEntitlements(organizationId);
  const allowed = entitlements.limits.ai && settings.enabled && process.env.AI_INSIGHTS_ENABLED === "true" && Boolean(process.env.OPENAI_API_KEY) && usage.requests < settings.monthlyRequestLimit && usage.tokens < settings.monthlyTokenLimit;
  if (allowed) {
    try { const generated = await generateWithOpenAi(snapshot); report = generated.report; inputTokens = generated.inputTokens; outputTokens = generated.outputTokens; provider = "openai"; status = "generated"; }
    catch (error) { errorCode = error instanceof Error ? error.message.slice(0, 80) : "PROVIDER_ERROR"; }
  } else errorCode = "AI_DISABLED_OR_BUDGET_REACHED";
  const [run] = await db.insert(insightRuns).values({ organizationId, createdBy: userId, status, provider, model: provider === "openai" ? model() : null, inputTokens, outputTokens, snapshotJson: JSON.stringify(snapshot), outputJson: JSON.stringify(report), errorCode }).returning();
  return run;
}

export async function getInsightDashboard(organizationId: string) {
  const [snapshot, settings, usage, runs] = await Promise.all([getInsightSnapshot(organizationId), getAiSettings(organizationId), monthlyUsage(organizationId), db.select().from(insightRuns).where(eq(insightRuns.organizationId, organizationId)).orderBy(sql`${insightRuns.createdAt} desc`).limit(10)]);
  return { snapshot, report: runs[0] ? JSON.parse(runs[0].outputJson) as InsightReport : buildDeterministicInsights(snapshot), settings, usage, runs };
}
