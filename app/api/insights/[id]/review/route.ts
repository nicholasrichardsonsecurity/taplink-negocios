import { and, eq } from "drizzle-orm";
import { getSessionContext } from "@/lib/auth/session";
import { db } from "@/packages/database/client";
import { auditLogs, insightRuns } from "@/packages/database/schema";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionContext();
  if (!session) return Response.json({ error: "Autenticação necessária." }, { status: 401 });
  if (!['owner', 'manager'].includes(session.role)) return Response.json({ error: "Permissão insuficiente." }, { status: 403 });
  const decision = (await request.formData()).get("decision") === "approve" ? "approved" : "rejected";
  const { id } = await params;
  const [run] = await db.update(insightRuns).set({ status: decision, reviewedBy: session.userId, reviewedAt: new Date() }).where(and(eq(insightRuns.id, id), eq(insightRuns.organizationId, session.organizationId))).returning({ id: insightRuns.id });
  if (!run) return Response.json({ error: "Análise não encontrada." }, { status: 404 });
  await db.insert(auditLogs).values({ organizationId: session.organizationId, actorUserId: session.userId, action: `insight.${decision}`, entityType: "insight_run", entityId: id });
  return Response.redirect(new URL("/dashboard/insights", request.url), 303);
}
