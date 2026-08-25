import { eq } from "drizzle-orm";
import { PLAN_CATALOG, type PlanLimits } from "@/lib/billing";
import { db } from "@/packages/database/client";
import { billingPlans, organizationSubscriptions } from "@/packages/database/schema";

const fallback = PLAN_CATALOG[0];

export async function getOrganizationEntitlements(organizationId: string) {
  const [row] = await db
    .select({ code: billingPlans.code, limitsJson: billingPlans.limitsJson, status: organizationSubscriptions.status })
    .from(organizationSubscriptions)
    .innerJoin(billingPlans, eq(billingPlans.id, organizationSubscriptions.planId))
    .where(eq(organizationSubscriptions.organizationId, organizationId))
    .limit(1);
  if (!row) return { code: fallback.code, status: "trial" as const, limits: fallback.limits as PlanLimits };
  try {
    return { code: row.code, status: row.status, limits: JSON.parse(row.limitsJson) as PlanLimits };
  } catch {
    return { code: fallback.code, status: row.status, limits: fallback.limits as PlanLimits };
  }
}
