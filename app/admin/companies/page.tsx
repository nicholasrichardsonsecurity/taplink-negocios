import { asc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { db } from "@/packages/database/client";
import { organizations } from "@/packages/database/schema";

export default async function CompaniesAdmin() {
  const session = await requireSession();
  if (session.platformRole !== "platform_admin") redirect("/dashboard");
  const companies = await db
    .select()
    .from(organizations)
    .orderBy(asc(organizations.name));
  return (
    <main style={{ maxWidth: 900, margin: "48px auto", padding: 24 }}>
      <a href="/admin/operations">← Operação da plataforma</a>
      <h1>Empresas</h1>
      <p>Administração interna da plataforma TapLink Negócios.</p>
      <form
        action="/api/admin/companies"
        method="post"
        style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "28px 0" }}
      >
        <input
          name="name"
          required
          minLength={2}
          placeholder="Nome da empresa"
        />
        <input
          name="slug"
          required
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          placeholder="identificador-da-empresa"
        />
        <button type="submit">Adicionar empresa</button>
      </form>
      {companies.map((company) => (
        <article
          key={company.id}
          style={{
            padding: 18,
            border: "1px solid #ddd",
            borderRadius: 14,
            marginTop: 10,
          }}
        >
          <b>{company.name}</b>
          <p>
            {company.slug} · {company.status}
          </p>
        </article>
      ))}
    </main>
  );
}
