export const PLAN_CATALOG = [
  { code: "essencial", name: "Essencial", priceCents: 3990, description: "Página, Wi-Fi, Google e até 5 placas.", limits: { plates: 5, users: 2, ai: false } },
  { code: "negocios", name: "Negócios", priceCents: 6990, description: "Analytics, insights e até 20 placas.", limits: { plates: 20, users: 5, ai: false } },
  { code: "premium", name: "Premium", priceCents: 9990, description: "IA opcional, prioridade e até 50 placas.", limits: { plates: 50, users: 10, ai: true } },
] as const;

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
