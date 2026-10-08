import { requireSession } from "@/lib/auth/session";
import { csrfToken } from "@/lib/security";
import ThemeToggle from "./ThemeToggle";
import DashboardFrame from "./DashboardFrame";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const s = await requireSession();

  const shell = (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="brand">
          <span>T</span>
          <b>TapLink</b>
        </div>

        <nav>
          <a href="/dashboard">Visão geral</a>
          <a href="/dashboard/page-editor">Página pública</a>
          <a href="/dashboard/organizations">Trocar empresa</a>

          {s.platformRole === "platform_admin" && (
            <>
              <a href="/admin/operations">Operação da plataforma</a>
              <a href="/admin/reconciliation">Conciliação Asaas</a>
              <a href="/admin/security">Segurança e sessões</a>
            </>
          )}

          <a href="/dashboard/analytics">Analytics</a>
          <a href="/dashboard/insights">Insights</a>
          <a href="/dashboard/billing">Plano e cobrança</a>
        </nav>

        <form action="/api/auth/logout" method="post">
          <input
            type="hidden"
            name="csrf"
            value={csrfToken(s.sessionTokenHash)}
          />
          <button type="submit">Sair</button>
        </form>
      </aside>

      <section className="dashboard-shell-content">
        <header className="dashboard-shell-header">
          <div>
            <small>EMPRESA ATIVA</small>
            <b>{s.organizationName}</b>
          </div>

          <div className="dashboard-shell-actions">
            <ThemeToggle />

            <div className="profile">
              <span>{s.userName.charAt(0)}</span>

              <div>
                <b>{s.userName}</b>
                <small>{s.role}</small>
              </div>
            </div>
          </div>
        </header>

        {children}
      </section>
    </main>
  );

  return (
    <DashboardFrame shell={shell}>
      {children}
    </DashboardFrame>
  );
}
