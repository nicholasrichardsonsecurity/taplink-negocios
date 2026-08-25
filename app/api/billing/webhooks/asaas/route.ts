import { processAsaasWebhook } from "@/lib/billing-service";

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > 128000) return new Response(null, { status: 413 });
  const result = await processAsaasWebhook(await request.text(), request.headers.get("asaas-access-token"));
  return Response.json(result.body, { status: result.status, headers: { "cache-control": "no-store" } });
}
