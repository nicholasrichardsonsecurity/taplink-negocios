import { asc, eq } from "drizzle-orm";
import { getSessionContext } from "@/lib/auth/session";
import { db } from "@/packages/database/client";
import {
  auditLogs,
  memberships,
  organizations,
  publicPages,
} from "@/packages/database/schema";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(80),
});
export async function GET() {
  const s = await getSessionContext();
  if (!s || s.platformRole !== "platform_admin")
    return Response.json(
      { error: "Acesso administrativo necessário." },
      { status: 403 },
    );
  return Response.json({
    companies: await db
      .select()
      .from(organizations)
      .orderBy(asc(organizations.name)),
  });
}
export async function POST(request: Request) {
  const s = await getSessionContext();
  if (!s || s.platformRole !== "platform_admin")
    return Response.json(
      { error: "Acesso administrativo necessário." },
      { status: 403 },
    );
  const type = request.headers.get("content-type") ?? "";
  const raw = type.includes("application/json")
    ? await request.json().catch(() => null)
    : Object.fromEntries(await request.formData().catch(() => new FormData()));
  const parsed = schema.safeParse(raw);
  if (!parsed.success)
    return Response.json(
      { error: "Nome ou identificador inválido." },
      { status: 400 },
    );
  const exists = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.slug, parsed.data.slug))
    .limit(1);
  if (exists.length)
    return Response.json(
      { error: "Identificador já utilizado." },
      { status: 409 },
    );
  const company = await db.transaction(async (tx) => {
    const [organization] = await tx
      .insert(organizations)
      .values({ ...parsed.data, status: "trial" })
      .returning();
    await tx
      .insert(memberships)
      .values({
        organizationId: organization.id,
        userId: s.userId,
        role: "owner",
      });
    await tx
      .insert(publicPages)
      .values({ organizationId: organization.id, slug: organization.slug });
    await tx
      .insert(auditLogs)
      .values({
        organizationId: organization.id,
        actorUserId: s.userId,
        action: "organization.created",
        entityType: "organization",
        entityId: organization.id,
      });
    return organization;
  });
  if (!type.includes("application/json"))
    return Response.redirect(new URL("/admin/companies", request.url), 303);
  return Response.json({ company }, { status: 201 });
}
