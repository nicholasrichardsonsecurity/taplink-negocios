import test from "node:test";
import assert from "node:assert/strict";
import { isAllowedInvoiceUrl, paymentStatusFromEvent, PLAN_CATALOG, subscriptionStatusFromPayment } from "../lib/billing";

test("catálogo comercial mantém códigos e preços esperados", () => {
  assert.deepEqual(PLAN_CATALOG.map(plan => [plan.code, plan.priceCents]), [["essencial", 3990], ["negocios", 6990], ["premium", 9990]]);
});
test("traduz somente eventos financeiros conhecidos", () => {
  assert.equal(paymentStatusFromEvent("PAYMENT_RECEIVED"), "received");
  assert.equal(paymentStatusFromEvent("PAYMENT_OVERDUE"), "overdue");
  assert.equal(paymentStatusFromEvent("CUSTOMER_UPDATED"), null);
});
test("pagamento recebido ativa e vencimento marca atraso", () => {
  assert.equal(subscriptionStatusFromPayment("received"), "active");
  assert.equal(subscriptionStatusFromPayment("overdue"), "past_due");
});
test("aceita fatura HTTPS apenas em domínio Asaas", () => {
  assert.match(isAllowedInvoiceUrl("https://sandbox.asaas.com/i/abc") ?? "", /asaas/);
  assert.equal(isAllowedInvoiceUrl("https://asaas.com.evil.test/i/abc"), null);
  assert.equal(isAllowedInvoiceUrl("javascript:alert(1)"), null);
});
