import { eq } from "drizzle-orm";
import { db } from "@/packages/database/client";
import { users } from "@/packages/database/schema";
import { loginSchema } from "@/lib/validation";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json(
      { error: "Dados de acesso inválidos." },
      { status: 400 },
    );
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
