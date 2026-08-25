import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/packages/database/client";
import {
  memberships,
  organizations,
  sessions,
  users,
} from "@/packages/database/schema";

export const SESSION_COOKIE = "taplink_session";
const DAYS = 7;
export const hashSessionToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + DAYS * 86400000);
  const [membership] = await db
    .select({ organizationId: memberships.organizationId })
    .from(memberships)
    .where(eq(memberships.userId, userId))
    .limit(1);
  await db
    .insert(sessions)
    .values({
      userId,
      activeOrganizationId: membership?.organizationId,
      tokenHash: hashSessionToken(token),
      expiresAt,
    });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function deleteSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token)
    await db
      .delete(sessions)
      .where(eq(sessions.tokenHash, hashSessionToken(token)));
  jar.delete(SESSION_COOKIE);
}

export async function getSessionContext() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const rows = await db
    .select({
      userId: users.id,
      userName: users.name,
      email: users.email,
      platformRole: users.platformRole,
      organizationId: organizations.id,
      organizationName: organizations.name,
      organizationSlug: organizations.slug,
      role: memberships.role,
      sessionTokenHash: sessions.tokenHash,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .innerJoin(
      memberships,
      and(
        eq(memberships.userId, users.id),
        eq(memberships.organizationId, sessions.activeOrganizationId),
      ),
    )
    .innerJoin(organizations, eq(organizations.id, memberships.organizationId))
    .where(
      and(
        eq(sessions.tokenHash, hashSessionToken(token)),
        gt(sessions.expiresAt, new Date()),
        eq(users.active, true),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function requireSession() {
  const context = await getSessionContext();
  if (!context) redirect("/login");
  return context;
}
