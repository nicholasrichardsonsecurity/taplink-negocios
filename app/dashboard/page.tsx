import { requireSession } from "@/lib/auth/session";

export default async function Dashboard() {
  const s = await requireSession();
  return (
    <main className="dashboard">
      <aside>
        <div className="brand">
          <span>T</span>
          <b>TapLink</b>
        </div>
        <nav>
          <a className="active">Visão geral</a>
          <a href="/dashboard/page-editor">Página pública</a>
          <a href="/dashboard/organizations">Trocar empresa</a>
          {s.platformRole === "platform_admin" && (
            <a href="/admin/companies">Administrar empresas</a>
          )}
          <a>Placas e NFC</a>
          <a href="/dashboard/analytics">Analytics</a>
          <a href="/dashboard/insights">Insights</a>
          <a>Equipe</a>
          <a href="/dashboard/billing">Plano e cobrança</a>
        </nav>
        <form action="/api/auth/logout" method="post">
          <button>Sair</button>
        </form>
      </aside>
      <section>
        <header>
          <div>
            <small>EMPRESA ATIVA</small>
            <h1>{s.organizationName}</h1>
          </div>
          <div className="profile">
            <span>{s.userName.charAt(0)}</span>
            <div>
              <b>{s.userName}</b>
              <small>{s.role}</small>
            </div>
          </div>
        </header>
        <div className="welcome">
          <small>MISSÃO 1.6</small>
          <h2>Dados que viram próximos passos.</h2>
          <p>
            Receba recomendações explicáveis, com orçamento e aprovação humana.
          </p>
        </div>
        <div className="metrics">
          <article>
            <small>PÁGINA PÚBLICA</small>
            <b>Editor ativo</b>
            <span>Rascunho e publicação</span>
          </article>
          <article>
            <small>EMPRESA</small>
            <b>{s.organizationSlug}</b>
            <span>Tenant ativo na sessão</span>
          </article>
          <article>
            <small>PERFIL</small>
            <b>{s.role}</b>
            <span>Permissão carregada do banco</span>
          </article>
        </div>
        <div className="next-card">
          <div>
            <small>EDITOR WHITE-LABEL</small>
            <h3>Personalize a página pública</h3>
            <p>Identidade visual, links, Wi-Fi e atalhos configuráveis.</p>
          </div>
          <a className="dashboard-cta" href="/dashboard/page-editor">
            Abrir editor
          </a>
        </div>
        <div className="next-card" style={{marginTop: 15}}><div><small>INSIGHTS</small><h3>Entenda a semana em segundos</h3><p>Relatório local sempre disponível e IA generativa opcional.</p></div><a className="dashboard-cta" href="/dashboard/insights">Abrir insights</a></div>
      </section>
    </main>
  );
}
