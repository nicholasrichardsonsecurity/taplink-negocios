import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/packages/database/client";
import { users } from "@/packages/database/schema";
import { requestPasswordReset } from "@/lib/password-reset";
import { consumeRateLimit, requestIp, securityHash } from "@/lib/security";

const schema = z.object({ email: z.email().trim().toLowerCase().max(180) });
const generic = { ok: true, message: "Se o e-mail estiver cadastrado, enviaremos as instruções." };
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json(generic, { headers: { "cache-control": "no-store" } });
  const rate = await consumeRateLimit({ scope: "password_reset", identity: securityHash(`${requestIp(request)}|${parsed.data.email}`), limit: 3, windowMs: 60 * 60_000 });
  if (!rate.allowed) return Response.json(generic, { headers: { "cache-control": "no-store", "retry-after": String(rate.retryAfterSeconds) } });
  const [user] = await db.select({ id: users.id, email: users.email }).from(users).where(andUser(parsed.data.email)).limit(1);
  if (user) await requestPasswordReset(user).catch(() => null);
  return Response.json(generic, { headers: { "cache-control": "no-store" } });
}
function andUser(email: string) { return eq(users.email, email); }
