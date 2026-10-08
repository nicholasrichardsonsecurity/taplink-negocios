import DashboardNav from "./DashboardNav";
import { requireSession } from "@/lib/auth/session";
import { csrfToken } from "@/lib/security";
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

	<DashboardNav platformAdmin={s.platformRole === "platform_admin"} />

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
