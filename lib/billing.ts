export const PLAN_CATALOG = [
  { code: "essencial", name: "Essencial", priceCents: 3990, description: "Página completa e gestão essencial para uma operação.", limits: { locations: 1, users: 2, analyticsDays: 30, csv: false, ai: false, support: "standard" } },
  { code: "negocios", name: "Negócios", priceCents: 6990, description: "Mais gestão, histórico e exportação para empresas em crescimento.", limits: { locations: 3, users: 5, analyticsDays: 90, csv: true, ai: false, support: "priority" } },
  { code: "premium", name: "Premium", priceCents: 9990, description: "Operação multiunidade, IA opcional e atendimento prioritário.", limits: { locations: 10, users: 10, analyticsDays: 90, csv: true, ai: true, support: "priority" } },
] as const;

export type PlanLimits = { locations: number; users: number; analyticsDays: 30 | 90; csv: boolean; ai: boolean; support: "standard" | "priority" };

export function allowedAnalyticsDays(requested: number, maximum: number) {
  return Math.min(requested, maximum) as 7 | 30 | 90;
}

export type BillingPaymentStatus = "pending" | "confirmed" | "received" | "overdue" | "refunded" | "cancelled";
export type BillingSubscriptionStatus = "pending" | "active" | "past_due" | "suspended";

export function paymentStatusFromEvent(event: string): BillingPaymentStatus | null {
  if (event === "PAYMENT_CREATED" || event === "PAYMENT_UPDATED") return "pending";
  if (event === "PAYMENT_CONFIRMED") return "confirmed";
  if (event === "PAYMENT_RECEIVED") return "received";
  if (event === "PAYMENT_OVERDUE") return "overdue";
  if (event.includes("REFUND") || event.includes("CHARGEBACK")) return "refunded";
  if (["PAYMENT_DELETED", "PAYMENT_BANK_SLIP_CANCELLED"].includes(event)) return "cancelled";
  return null;
}

export function subscriptionStatusFromPayment(status: BillingPaymentStatus): BillingSubscriptionStatus | null {
  if (["confirmed", "received"].includes(status)) return "active";
  if (status === "overdue") return "past_due";
  if (["refunded", "cancelled"].includes(status)) return "suspended";
  return status === "pending" ? "pending" : null;
}

export const money = (cents: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

export function isAllowedInvoiceUrl(value: unknown) {
  if (typeof value !== "string") return null;
  try { const url = new URL(value); return url.protocol === "https:" && (url.hostname === "asaas.com" || url.hostname.endsWith(".asaas.com")) ? url.toString() : null; } catch { return null; }
}
