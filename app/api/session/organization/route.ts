import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { hashSessionToken, SESSION_COOKIE } from "@/lib/auth/session";
import { db } from "@/packages/database/client";
import { memberships, sessions } from "@/packages/database/schema";

export async function POST(request: Request) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token)
    return Response.json(
      { error: "Autenticação necessária." },
      { status: 401 },
    );
  const contentType = request.headers.get("content-type") ?? "";
  let organizationId = "";
  if (contentType.includes("application/json"))
    organizationId = String(
      (await request.json().catch(() => ({}))).organizationId ?? "",
    );
  else
    organizationId = String(
      (await request.formData().catch(() => new FormData())).get(
        "organizationId",
      ) ?? "",
    );
  const [session] = await db
    .select({ id: sessions.id, userId: sessions.userId })
    .from(sessions)
    .where(eq(sessions.tokenHash, hashSessionToken(token)))
    .limit(1);
  if (!session)
    return Response.json({ error: "Sessão inválida." }, { status: 401 });
  const [membership] = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(
      and(
        eq(memberships.userId, session.userId),
        eq(memberships.organizationId, organizationId),
      ),
    )
    .limit(1);
  if (!membership)
    return Response.json(
      { error: "Acesso à empresa negado." },
      { status: 403 },
    );
  await db
    .update(sessions)
    .set({ activeOrganizationId: organizationId, lastSeenAt: new Date() })
    .where(eq(sessions.id, session.id));
  if (!contentType.includes("application/json"))
    return Response.redirect(new URL("/dashboard", request.url), 303);
  return Response.json({ ok: true });
}
