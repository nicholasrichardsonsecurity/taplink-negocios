import { createHash, timingSafeEqual } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/packages/database/client";
import { auditLogs, billingPayments, billingPlans, billingWebhookEvents, organizationSubscriptions } from "@/packages/database/schema";
import { isAllowedInvoiceUrl, paymentStatusFromEvent, PLAN_CATALOG, subscriptionStatusFromPayment } from "@/lib/billing";

export async function seedPlans() {
  for (const plan of PLAN_CATALOG) await db.insert(billingPlans).values({ code: plan.code, name: plan.name, priceCents: plan.priceCents, limitsJson: JSON.stringify(plan.limits) }).onConflictDoUpdate({ target: billingPlans.code, set: { name: plan.name, priceCents: plan.priceCents, limitsJson: JSON.stringify(plan.limits), active: true, updatedAt: new Date() } });
}

export async function getBillingDashboard(organizationId: string) {
  const [plans, rows, payments] = await Promise.all([
    db.select().from(billingPlans).where(eq(billingPlans.active, true)).orderBy(billingPlans.priceCents),
    db.select({ subscription: organizationSubscriptions, plan: billingPlans }).from(organizationSubscriptions).innerJoin(billingPlans, eq(billingPlans.id, organizationSubscriptions.planId)).where(eq(organizationSubscriptions.organizationId, organizationId)).limit(1),
    db.select().from(billingPayments).where(eq(billingPayments.organizationId, organizationId)).orderBy(desc(billingPayments.createdAt)).limit(12),
  ]);
  return { plans, current: rows[0] ?? null, payments };
}

function tokenMatches(received: string | null) {
  const expected = process.env.ASAAS_WEBHOOK_SECRET;
  if (!expected || expected.length < 32 || !received) return false;
  const a = Buffer.from(expected), b = Buffer.from(received);
  return a.length === b.length && timingSafeEqual(a, b);
}

type AsaasEvent = { id?: unknown; event?: unknown; payment?: { id?: unknown; subscription?: unknown; value?: unknown; dueDate?: unknown; paymentDate?: unknown; clientPaymentDate?: unknown; invoiceUrl?: unknown } };

export async function processAsaasWebhook(raw: string, receivedToken: string | null) {
  if (!tokenMatches(receivedToken)) return { status: 401, body: { error: "Webhook não autorizado." } };
  let payload: AsaasEvent;
  try { payload = JSON.parse(raw) as AsaasEvent; } catch { return { status: 400, body: { error: "JSON inválido." } }; }
  if (typeof payload.id !== "string" || typeof payload.event !== "string" || typeof payload.payment?.id !== "string") return { status: 400, body: { error: "Evento inválido." } };
  const eventId = payload.id;
  const eventType = payload.event;
  const payment = payload.payment;
  const paymentStatus = paymentStatusFromEvent(eventType);
  if (!paymentStatus) return { status: 200, body: { ok: true, ignored: true } };
  const hash = createHash("sha256").update(raw).digest("hex");
  return db.transaction(async tx => {
    const [event] = await tx.insert(billingWebhookEvents).values({ providerEventId: eventId, eventType, payloadHash: hash }).onConflictDoNothing({ target: billingWebhookEvents.providerEventId }).returning();
    if (!event) return { status: 200, body: { ok: true, duplicate: true } };
    const providerSubscriptionId = payment.subscription;
    if (typeof providerSubscriptionId !== "string") { await tx.update(billingWebhookEvents).set({ processed: true, errorCode: "SUBSCRIPTION_MISSING", processedAt: new Date() }).where(eq(billingWebhookEvents.id, event.id)); return { status: 200, body: { ok: true, ignored: true } }; }
    const [subscription] = await tx.select().from(organizationSubscriptions).where(eq(organizationSubscriptions.providerSubscriptionId, providerSubscriptionId)).limit(1);
    if (!subscription) { await tx.update(billingWebhookEvents).set({ processed: true, errorCode: "SUBSCRIPTION_NOT_FOUND", processedAt: new Date() }).where(eq(billingWebhookEvents.id, event.id)); return { status: 200, body: { ok: true, ignored: true } }; }
    const value = Number(payment.value);
    const paidAtRaw = payment.paymentDate ?? payment.clientPaymentDate;
    const paidAt = typeof paidAtRaw === "string" && !Number.isNaN(Date.parse(paidAtRaw)) ? new Date(paidAtRaw) : null;
    const dueDateRaw = payment.dueDate;
    const dueDate = typeof dueDateRaw === "string" && !Number.isNaN(Date.parse(dueDateRaw)) ? new Date(`${dueDateRaw}T12:00:00Z`) : null;
    await tx.insert(billingPayments).values({ organizationId: subscription.organizationId, subscriptionId: subscription.id, providerPaymentId: payment.id as string, status: paymentStatus, valueCents: Number.isFinite(value) ? Math.round(value * 100) : 0, dueDate, paidAt, invoiceUrl: isAllowedInvoiceUrl(payment.invoiceUrl), updatedAt: new Date() }).onConflictDoUpdate({ target: billingPayments.providerPaymentId, set: { status: paymentStatus, valueCents: Number.isFinite(value) ? Math.round(value * 100) : 0, dueDate, paidAt, invoiceUrl: isAllowedInvoiceUrl(payment.invoiceUrl), updatedAt: new Date() } });
    const nextStatus = subscriptionStatusFromPayment(paymentStatus);
    if (nextStatus) await tx.update(organizationSubscriptions).set({ status: nextStatus, pastDueAt: nextStatus === "past_due" ? new Date() : null, updatedAt: new Date() }).where(and(eq(organizationSubscriptions.id, subscription.id), eq(organizationSubscriptions.organizationId, subscription.organizationId)));
    await tx.insert(auditLogs).values({ organizationId: subscription.organizationId, action: `billing.${eventType.toLowerCase()}`, entityType: "billing_payment", entityId: payment.id as string, metadataJson: JSON.stringify({ eventId, paymentStatus }) });
    await tx.update(billingWebhookEvents).set({ processed: true, processedAt: new Date() }).where(eq(billingWebhookEvents.id, event.id));
    return { status: 200, body: { ok: true } };
  });
}
