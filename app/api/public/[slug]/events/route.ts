import { eq } from "drizzle-orm";
import { z } from "zod";
import {
  analyticsActions,
  analyticsDedupeKey,
  anonymousVisitorHash,
  clientIp,
  normalizeAnalyticsSource,
} from "@/lib/analytics";
import { db } from "@/packages/database/client";
import { analyticsEvents, publicPages } from "@/packages/database/schema";
import { consumeRateLimit, requestIp, securityHash } from "@/lib/security";

const eventSchema = z.discriminatedUnion("eventType", [
  z.object({
    eventType: z.literal("page_view"),
    source: z.string().max(16).optional(),
  }),
  z.object({
    eventType: z.literal("action_click"),
    action: z.enum(analyticsActions),
    source: z.string().max(16).optional(),
  }),
]);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (Number(request.headers.get("content-length") ?? 0) > 2048)
    return new Response(null, { status: 413 });
  const parsed = eventSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json({ error: "Evento inválido." }, { status: 400 });
  const { slug } = await params;
  const rate = await consumeRateLimit({ scope: "public_events", identity: securityHash(`${requestIp(request)}|${slug}`), limit: 120, windowMs: 60_000 });
  if (!rate.allowed) return new Response(null, { status: 429, headers: { "retry-after": String(rate.retryAfterSeconds) } });
  const [page] = await db
    .select({
      id: publicPages.id,
      organizationId: publicPages.organizationId,
      published: publicPages.published,
    })
    .from(publicPages)
    .where(eq(publicPages.slug, slug))
    .limit(1);
  if (!page?.published) return new Response(null, { status: 404 });
  const now = new Date();
  const visitorHash = anonymousVisitorHash(
    clientIp(request.headers),
    (request.headers.get("user-agent") ?? "unknown").slice(0, 300),
    now,
  );
  const action = "action" in parsed.data ? parsed.data.action : null;
  const dedupeKey = analyticsDedupeKey({
    organizationId: page.organizationId,
    eventType: parsed.data.eventType,
    action,
    visitorHash,
    date: now,
  });
  await db
    .insert(analyticsEvents)
    .values({
      organizationId: page.organizationId,
      publicPageId: page.id,
      eventType: parsed.data.eventType,
      action,
      source: normalizeAnalyticsSource(parsed.data.source),
      visitorHash,
      dedupeKey,
      occurredAt: now,
    })
    .onConflictDoNothing({ target: analyticsEvents.dedupeKey });
  return new Response(null, {
    status: 202,
    headers: { "cache-control": "no-store" },
  });
}
