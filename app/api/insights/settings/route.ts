import { eq } from "drizzle-orm";
import { getSessionContext } from "@/lib/auth/session";
import { db } from "@/packages/database/client";
import { auditLogs, organizationAiSettings } from "@/packages/database/schema";

export async function POST(request: Request) {
  const session = await getSessionContext();
  if (!session) return Response.json({ error: "Autenticação necessária." }, { status: 401 });
  if (session.role !== "owner") return Response.json({ error: "Somente o proprietário pode alterar a IA." }, { status: 403 });
  const data = await request.formData();
  const enabled = data.get("enabled") === "on";
  const monthlyRequestLimit = Math.min(100, Math.max(1, Number(data.get("requestLimit")) || 20));
  const monthlyTokenLimit = Math.min(500000, Math.max(1000, Number(data.get("tokenLimit")) || 50000));
  await db.transaction(async tx => {
    await tx.insert(organizationAiSettings).values({ organizationId: session.organizationId, enabled, monthlyRequestLimit, monthlyTokenLimit, requiresApproval: true, updatedAt: new Date() }).onConflictDoUpdate({ target: organizationAiSettings.organizationId, set: { enabled, monthlyRequestLimit, monthlyTokenLimit, requiresApproval: true, updatedAt: new Date() } });
    await tx.insert(auditLogs).values({ organizationId: session.organizationId, actorUserId: session.userId, action: "ai_settings.updated", entityType: "organization_ai_settings", entityId: session.organizationId, metadataJson: JSON.stringify({ enabled, monthlyRequestLimit, monthlyTokenLimit }) });
  });
  return Response.redirect(new URL("/dashboard/insights", request.url), 303);
}
