import { eq } from "drizzle-orm";
import { z } from "zod";
import { getSessionContext } from "@/lib/auth/session";
import { ensureAsaasCustomer, ensureAsaasSubscription } from "@/lib/asaas";
import { seedPlans } from "@/lib/billing-service";
import { db } from "@/packages/database/client";
import { auditLogs, billingPlans, organizationSubscriptions } from "@/packages/database/schema";
import { validCsrf } from "@/lib/security";

const schema = z.object({ plan: z.enum(["essencial", "negocios", "premium"]), name: z.string().trim().min(3).max(120), cpfCnpj: z.string().transform(v => v.replace(/\D/g, "")).refine(v => [11, 14].includes(v.length), "Documento inválido"), email: z.string().email().max(180), phone: z.string().max(24).optional(), billingType: z.enum(["PIX", "BOLETO"]) });

export async function POST(request: Request) {
  const session = await getSessionContext();
  if (!session) return Response.json({ error: "Autenticação necessária." }, { status: 401 });
  if (session.role !== "owner") return Response.json({ error: "Somente o proprietário pode contratar um plano." }, { status: 403 });
  const form = await request.formData();
  if (!validCsrf(request, session.sessionTokenHash, form.get("csrf"))) return Response.json({ error: "Validação de segurança expirada." }, { status: 403 });
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return Response.redirect(new URL("/dashboard/billing?error=dados", request.url), 303);
  await seedPlans();
  const [plan] = await db.select().from(billingPlans).where(eq(billingPlans.code, parsed.data.plan)).limit(1);
  if (!plan?.active) return Response.redirect(new URL("/dashboard/billing?error=plano", request.url), 303);
  try {
    const customerId = await ensureAsaasCustomer({ organizationId: session.organizationId, name: parsed.data.name, cpfCnpj: parsed.data.cpfCnpj, email: parsed.data.email, phone: parsed.data.phone });
    const trialEndsAt = new Date(Date.now() + 14 * 86400000);
    const providerSubscriptionId = await ensureAsaasSubscription({ organizationId: session.organizationId, customerId, valueCents: plan.priceCents, planName: plan.name, billingType: parsed.data.billingType, nextDueDate: trialEndsAt.toISOString().slice(0, 10) });
    await db.transaction(async tx => {
      await tx.insert(organizationSubscriptions).values({ organizationId: session.organizationId, planId: plan.id, status: "trial", billingType: parsed.data.billingType, providerCustomerId: customerId, providerSubscriptionId, trialEndsAt, updatedAt: new Date() }).onConflictDoUpdate({ target: organizationSubscriptions.organizationId, set: { planId: plan.id, status: "trial", billingType: parsed.data.billingType, providerCustomerId: customerId, providerSubscriptionId, trialEndsAt, updatedAt: new Date() } });
      await tx.insert(auditLogs).values({ organizationId: session.organizationId, actorUserId: session.userId, action: "billing.subscription_created", entityType: "organization_subscription", entityId: providerSubscriptionId, metadataJson: JSON.stringify({ planCode: plan.code, billingType: parsed.data.billingType, environment: "sandbox" }) });
    });
    return Response.redirect(new URL("/dashboard/billing?created=1", request.url), 303);
  } catch (error) {
    const code = error instanceof Error ? error.message : "ASAAS_ERROR";
    await db.insert(auditLogs).values({ organizationId: session.organizationId, actorUserId: session.userId, action: "billing.subscription_failed", entityType: "organization_subscription", metadataJson: JSON.stringify({ code: code.slice(0, 80), environment: "sandbox" }) });
    return Response.redirect(new URL(`/dashboard/billing?error=${code === "ASAAS_NOT_CONFIGURED" ? "config" : "asaas"}`, request.url), 303);
  }
}
