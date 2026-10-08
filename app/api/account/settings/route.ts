import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/packages/database/client";
import { auditLogs, sessions, users } from "@/packages/database/schema";
import { getSessionContext } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { validCsrf } from "@/lib/security";

const schema = z.object({
  csrf: z.string().min(20),
  name: z.string().trim().min(2).max(120),
  email: z.email().trim().toLowerCase().max(180),
  currentPassword: z.string().max(128).optional().or(z.literal("")),
  newPassword: z.string().min(10).max(128).optional().or(z.literal("")),
});

export async function PUT(request: Request) {
  const session = await getSessionContext();

  if (!session) {
    return Response.json(
      { error: "Autenticação necessária." },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Confira os dados informados." },
      { status: 400 },
    );
  }

  if (!validCsrf(request, session.sessionTokenHash, parsed.data.csrf)) {
    return Response.json(
      { error: "Validação de segurança expirada." },
      { status: 403 },
    );
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  const passwordChanged = Boolean(parsed.data.newPassword);

if (
  !user ||
  (passwordChanged &&
    (!parsed.data.currentPassword ||
      !(await verifyPassword(parsed.data.currentPassword, user.passwordHash))))
 ) {
  return Response.json(
    { error: "A senha atual está incorreta." },
    { status: 403 },
   );
}

  const emailInUse = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.email, parsed.data.email), ne(users.id, user.id)))
    .limit(1);

  if (emailInUse.length > 0) {
    return Response.json(
      { error: "Este e-mail já está sendo utilizado." },
      { status: 409 },
    );
  }

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({
        name: parsed.data.name,
        email: parsed.data.email,
        ...(passwordChanged
          ? { passwordHash: await hashPassword(parsed.data.newPassword!) }
          : {}),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    if (passwordChanged) {
      await tx
        .delete(sessions)
        .where(
          and(
            eq(sessions.userId, user.id),
            ne(sessions.tokenHash, session.sessionTokenHash),
          ),
        );
    }

    await tx.insert(auditLogs).values({
      actorUserId: user.id,
      action: "account.settings.updated",
      entityType: "user",
      entityId: user.id,
      metadataJson: JSON.stringify({
        changedName: user.name !== parsed.data.name,
        changedEmail: user.email !== parsed.data.email,
        changedPassword: passwordChanged,
      }),
    });
  });

  return Response.json({
    ok: true,
    name: parsed.data.name,
    email: parsed.data.email,
  });
}
