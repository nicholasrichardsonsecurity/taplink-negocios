import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/packages/database/client";
import { auditLogs, passwordResetTokens, sessions, users } from "@/packages/database/schema";
import { createResetToken, hashResetToken } from "@/lib/security";
import { hashPassword } from "@/lib/auth/password";

async function deliver(email: string, token: string, idempotencyKey: string) {
  const key = process.env.RESEND_API_KEY, from = process.env.MAIL_FROM, appUrl = process.env.APP_URL;
  if (!key || !from || !appUrl) return false;
  const resetUrl = new URL("/reset-password", appUrl); resetUrl.searchParams.set("token", token);
  try {
    const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { authorization: `Bearer ${key}`, "content-type": "application/json", "idempotency-key": idempotencyKey }, body: JSON.stringify({ from, to: [email], subject: "Redefina sua senha do TapLink Negócios", text: `Recebemos um pedido para redefinir sua senha. O link expira em 30 minutos e só pode ser usado uma vez:\n\n${resetUrl.toString()}\n\nSe você não pediu, ignore esta mensagem.` }), signal: AbortSignal.timeout(12000) });
    return response.ok;
  } catch { return false; }
}

export async function requestPasswordReset(user: { id: string; email: string }) {
  const token = createResetToken();
  const [row] = await db.insert(passwordResetTokens).values({ userId: user.id, tokenHash: hashResetToken(token), expiresAt: new Date(Date.now() + 30 * 60_000) }).returning({ id: passwordResetTokens.id });
  const delivered = await deliver(user.email, token, `password-reset-${row.id}`);
  await db.insert(auditLogs).values({ action: "auth.password_reset_requested", entityType: "user", entityId: user.id, metadataJson: JSON.stringify({ delivered }) });
  return { delivered };
}

export async function consumePasswordReset(token: string, password: string) {
  return db.transaction(async tx => {
    const [reset] = await tx.update(passwordResetTokens).set({ usedAt: new Date() }).where(and(eq(passwordResetTokens.tokenHash, hashResetToken(token)), gt(passwordResetTokens.expiresAt, new Date()), isNull(passwordResetTokens.usedAt))).returning({ id: passwordResetTokens.id, userId: passwordResetTokens.userId });
    if (!reset) return false;
    await tx.update(users).set({ passwordHash: await hashPassword(password), updatedAt: new Date() }).where(eq(users.id, reset.userId));
    await tx.delete(sessions).where(eq(sessions.userId, reset.userId));
    await tx.insert(auditLogs).values({ actorUserId: reset.userId, action: "auth.password_reset_completed", entityType: "user", entityId: reset.userId, metadataJson: JSON.stringify({ sessionsRevoked: true }) });
    return true;
  });
}
