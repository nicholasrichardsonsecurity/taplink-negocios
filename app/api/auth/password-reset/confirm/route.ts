import { z } from "zod";
import { consumePasswordReset } from "@/lib/password-reset";
import { consumeRateLimit, requestIp, securityHash } from "@/lib/security";

const schema = z.object({ token: z.string().min(40).max(100), password: z.string().min(10).max(128) });
export async function POST(request: Request) {
  const rate = await consumeRateLimit({ scope: "password_reset_confirm", identity: securityHash(requestIp(request)), limit: 10, windowMs: 15 * 60_000 });
  if (!rate.allowed) return Response.json({ error: "Muitas tentativas. Aguarde e tente novamente." }, { status: 429, headers: { "retry-after": String(rate.retryAfterSeconds) } });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !(await consumePasswordReset(parsed.data.token, parsed.data.password))) return Response.json({ error: "Link inválido, expirado ou já utilizado." }, { status: 400, headers: { "cache-control": "no-store" } });
  return Response.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}
