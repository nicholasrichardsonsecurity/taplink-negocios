const sandboxBase = "https://api-sandbox.asaas.com/v3";
type Json = Record<string, unknown>;

function configured() {
  if (process.env.ASAAS_ENVIRONMENT !== "sandbox") throw new Error("ASAAS_SANDBOX_REQUIRED");
  if (!process.env.ASAAS_API_KEY) throw new Error("ASAAS_NOT_CONFIGURED");
  return { base: process.env.ASAAS_API_URL || sandboxBase, key: process.env.ASAAS_API_KEY };
}

async function request(path: string, init: RequestInit = {}) {
  const { base, key } = configured();
  const response = await fetch(`${base}${path}`, { ...init, headers: { access_token: key, accept: "application/json", ...(init.body ? { "content-type": "application/json" } : {}), ...init.headers }, signal: AbortSignal.timeout(12000) });
  const data = await response.json().catch(() => ({})) as Json;
  if (!response.ok) throw new Error(`ASAAS_HTTP_${response.status}`);
  return data;
}

export async function updateAsaasSubscription(id: string, changes: { valueCents?: number; planName?: string; status?: "ACTIVE" | "INACTIVE" }) {
  await request(`/subscriptions/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify({ ...(changes.valueCents !== undefined ? { value: changes.valueCents / 100, description: `TapLink Negócios — ${changes.planName}`, updatePendingPayments: false } : {}), ...(changes.status ? { status: changes.status } : {}) }) });
}

export async function cancelAsaasSubscription(id: string) {
  await request(`/subscriptions/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function ensureAsaasCustomer(input: { organizationId: string; name: string; cpfCnpj: string; email: string; phone?: string }) {
  const externalReference = `taplink:${input.organizationId}`;
  const found = await request(`/customers?externalReference=${encodeURIComponent(externalReference)}&limit=1`) as { data?: { id?: string }[] };
  if (found.data?.[0]?.id) return found.data[0].id;
  const created = await request("/customers", { method: "POST", body: JSON.stringify({ name: input.name, cpfCnpj: input.cpfCnpj.replace(/\D/g, ""), email: input.email, mobilePhone: input.phone?.replace(/\D/g, ""), externalReference, notificationDisabled: false }) });
  if (typeof created.id !== "string") throw new Error("ASAAS_CUSTOMER_ID_MISSING");
  return created.id;
}

export async function ensureAsaasSubscription(input: { organizationId: string; customerId: string; valueCents: number; planName: string; billingType: "PIX" | "BOLETO"; nextDueDate: string }) {
  const externalReference = `taplink-subscription:${input.organizationId}`;
  const found = await request(`/subscriptions?externalReference=${encodeURIComponent(externalReference)}&limit=1`) as { data?: { id?: string }[] };
  if (found.data?.[0]?.id) return found.data[0].id;
  const created = await request("/subscriptions", { method: "POST", body: JSON.stringify({ customer: input.customerId, billingType: input.billingType, nextDueDate: input.nextDueDate, value: input.valueCents / 100, cycle: "MONTHLY", description: `TapLink Negócios — ${input.planName}`, externalReference }) });
  if (typeof created.id !== "string") throw new Error("ASAAS_SUBSCRIPTION_ID_MISSING");
  return created.id;
}
