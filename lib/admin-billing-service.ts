import { and, count, desc, eq, inArray, sql } from "drizzle-orm";
import { cancelAsaasSubscription, updateAsaasSubscription } from "@/lib/asaas";
import { db } from "@/packages/database/client";
import { auditLogs, billingPayments, billingPlans, billingWebhookEvents, memberships, organizations, organizationSubscriptions } from "@/packages/database/schema";

export async function getPlatformOperations() {
  const [companies, memberRows, webhooks, [totals], [revenue]] = await Promise.all([
    db.select({ organization: organizations, subscription: organizationSubscriptions, plan: billingPlans })
      .from(organizations)
      .leftJoin(organizationSubscriptions, eq(organizationSubscriptions.organizationId, organizations.id))
      .leftJoin(billingPlans, eq(billingPlans.id, organizationSubscriptions.planId))
      .orderBy(desc(organizations.createdAt)),
    db.select({ organizationId: memberships.organizationId, value: count() }).from(memberships).groupBy(memberships.organizationId),
    db.select().from(billingWebhookEvents).orderBy(desc(billingWebhookEvents.receivedAt)).limit(30),
    db.select({ companies: count(), active: sql<number>`count(*) filter (where ${organizations.status} = 'active')` }).from(organizations),
    db.select({ valueCents: sql<number>`coalesce(sum(${billingPayments.valueCents}), 0)` }).from(billingPayments).where(inArray(billingPayments.status, ["confirmed", "received"])),
  ]);
  const members = new Map(memberRows.map(row => [row.organizationId, Number(row.value)]));
  return { companies: companies.map(row => ({ ...row, memberCount: members.get(row.organization.id) ?? 0 })), webhooks, metrics: { companies: Number(totals.companies), active: Number(totals.active), revenueCents: Number(revenue.valueCents), failedWebhooks: webhooks.filter(item => Boolean(item.errorCode)).length } };
}

type AdminAction = { actorUserId: string; organizationId: string; action: "change_plan" | "suspend" | "reactivate" | "cancel"; planCode?: string; reason: string };

export async function applySubscriptionAdminAction(input: AdminAction) {
  const [row] = await db.select({ organization: organizations, subscription: organizationSubscriptions, plan: billingPlans })
    .from(organizations)
    .leftJoin(organizationSubscriptions, eq(organizationSubscriptions.organizationId, organizations.id))
    .leftJoin(billingPlans, eq(billingPlans.id, organizationSubscriptions.planId))
    .where(eq(organizations.id, input.organizationId)).limit(1);
  if (!row) throw new Error("ORGANIZATION_NOT_FOUND");
  if (!row.subscription) throw new Error("SUBSCRIPTION_NOT_FOUND");

  const providerId = row.subscription.providerSubscriptionId;
  let nextPlan = row.plan;
  let nextStatus = row.subscription.status;
  if (input.action === "change_plan") {
    if (!input.planCode) throw new Error("PLAN_REQUIRED");
    [nextPlan] = await db.select().from(billingPlans).where(and(eq(billingPlans.code, input.planCode), eq(billingPlans.active, true))).limit(1);
    if (!nextPlan) throw new Error("PLAN_NOT_FOUND");
    if (providerId) await updateAsaasSubscription(providerId, { valueCents: nextPlan.priceCents, planName: nextPlan.name });
  } else if (input.action === "suspend") {
    if (providerId) await updateAsaasSubscription(providerId, { status: "INACTIVE" });
    nextStatus = "suspended";
  } else if (input.action === "reactivate") {
    if (providerId) await updateAsaasSubscription(providerId, { status: "ACTIVE" });
    nextStatus = "active";
  } else {
    if (providerId) await cancelAsaasSubscription(providerId);
    nextStatus = "cancelled";
  }

  await db.transaction(async tx => {
    await tx.update(organizationSubscriptions).set({ planId: nextPlan?.id ?? row.subscription!.planId, status: nextStatus, suspendedAt: nextStatus === "suspended" ? new Date() : null, updatedAt: new Date() }).where(eq(organizationSubscriptions.id, row.subscription!.id));
    await tx.update(organizations).set({ status: nextStatus === "active" ? "active" : nextStatus === "cancelled" ? "cancelled" : nextStatus === "suspended" ? "suspended" : row.organization.status, updatedAt: new Date() }).where(eq(organizations.id, row.organization.id));
    await tx.insert(auditLogs).values({ organizationId: row.organization.id, actorUserId: input.actorUserId, action: `platform.billing.${input.action}`, entityType: "organization_subscription", entityId: row.subscription!.id, metadataJson: JSON.stringify({ reason: input.reason, previousPlan: row.plan?.code ?? null, nextPlan: nextPlan?.code ?? null, previousStatus: row.subscription!.status, nextStatus, providerUpdated: Boolean(providerId) }) });
  });
}
