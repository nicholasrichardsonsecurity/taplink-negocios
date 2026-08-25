import { z } from "zod";
import { getSessionContext } from "@/lib/auth/session";
import { applySubscriptionAdminAction } from "@/lib/admin-billing-service";
import { db } from "@/packages/database/client";
import { eq } from "drizzle-orm";
import { organizations } from "@/packages/database/schema";

const schema = z.object({
  organizationId: z.uuid(),
  action: z.enum(["change_plan", "suspend", "reactivate", "cancel"]),
  planCode: z.enum(["essencial", "negocios", "premium"]).optional(),
  reason: z.string().trim().min(5).max(300),
  confirmation: z.string().trim().max(80),
});

export async function POST(request: Request) {
  const session = await getSessionContext();
  if (!session || session.platformRole !== "platform_admin") return Response.json({ error: "Acesso administrativo necessário." }, { status: 403 });
  const parsed = schema.safeParse(Object.fromEntries(await request.formData().catch(() => new FormData())));
  if (!parsed.success) return Response.json({ error: "Operação administrativa inválida." }, { status: 400 });
  const [organization] = await db.select({ slug: organizations.slug }).from(organizations).where(eq(organizations.id, parsed.data.organizationId)).limit(1);
  if (!organization || parsed.data.confirmation !== organization.slug) return Response.json({ error: "Digite o identificador exato da empresa para confirmar." }, { status: 400 });
  try {
    await applySubscriptionAdminAction({ actorUserId: session.userId, organizationId: parsed.data.organizationId, action: parsed.data.action, planCode: parsed.data.planCode, reason: parsed.data.reason });
    return Response.redirect(new URL("/admin/operations?updated=1", request.url), 303);
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    return Response.redirect(new URL(`/admin/operations?error=${encodeURIComponent(code)}`, request.url), 303);
  }
}
