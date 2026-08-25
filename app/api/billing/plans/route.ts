import { eq } from "drizzle-orm";
import { db } from "@/packages/database/client";
import { billingPlans } from "@/packages/database/schema";

export async function GET() {
  const plans = await db.select({ code: billingPlans.code, name: billingPlans.name, priceCents: billingPlans.priceCents, limitsJson: billingPlans.limitsJson }).from(billingPlans).where(eq(billingPlans.active, true)).orderBy(billingPlans.priceCents);
  return Response.json({ plans: plans.map(plan => ({ ...plan, limits: JSON.parse(plan.limitsJson), limitsJson: undefined })) }, { headers: { "cache-control": "public, max-age=300" } });
}
