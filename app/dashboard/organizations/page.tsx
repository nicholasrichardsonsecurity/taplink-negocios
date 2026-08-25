import { eq } from "drizzle-orm";
import { requireSession } from "@/lib/auth/session";
import { db } from "@/packages/database/client";
import { memberships, organizations } from "@/packages/database/schema";

export default async function OrganizationsPage() {
  const session = await requireSession();
  const companies = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      status: organizations.status,
      role: memberships.role,
    })
    .from(memberships)
    .innerJoin(organizations, eq(organizations.id, memberships.organizationId))
    .where(eq(memberships.userId, session.userId));
  return (
    <main style={{ maxWidth: 760, margin: "48px auto", padding: 24 }}>
      <a href="/dashboard">← Voltar</a>
      <h1>Escolher empresa</h1>
      <p>A empresa ativa define os dados exibidos e editados no painel.</p>
      {companies.map((company) => (
        <form
          key={company.id}
          action="/api/session/organization"
          method="post"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 20,
            marginTop: 12,
            border: "1px solid #ddd",
            borderRadius: 16,
          }}
        >
          <input type="hidden" name="organizationId" value={company.id} />
          <div>
            <b>{company.name}</b>
            <br />
            <small>
              {company.slug} · {company.role} · {company.status}
            </small>
          </div>
          <button
            type="submit"
            disabled={company.id === session.organizationId}
          >
            {company.id === session.organizationId ? "Ativa" : "Selecionar"}
          </button>
        </form>
      ))}
    </main>
  );
}
