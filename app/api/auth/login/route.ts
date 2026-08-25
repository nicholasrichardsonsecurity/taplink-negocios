import { eq } from "drizzle-orm";
import { db } from "@/packages/database/client";
import { users } from "@/packages/database/schema";
import { loginSchema } from "@/lib/validation";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { consumeRateLimit, requestIp, securityHash } from "@/lib/security";

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json(
      { error: "Dados de acesso inválidos." },
      { status: 400 },
    );
  const rate = await consumeRateLimit({ scope: "login", identity: securityHash(`${requestIp(request)}|${parsed.data.email}`), limit: 8, windowMs: 15 * 60_000 });
  if (!rate.allowed) return Response.json({ error: "Muitas tentativas. Aguarde antes de tentar novamente." }, { status: 429, headers: { "retry-after": String(rate.retryAfterSeconds), "cache-control": "no-store" } });
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1);
  if (
    !user ||
    !user.active ||
    !(await verifyPassword(parsed.data.password, user.passwordHash))
  )
    return Response.json(
      { error: "E-mail ou senha incorretos." },
      { status: 401 },
    );
  await createSession(user.id);
  return Response.json({ ok: true });
}
