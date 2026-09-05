import { requireSession } from "@/lib/auth/session";
import { csrfToken } from "@/lib/security";

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
            <><a href="/admin/operations">Operação da plataforma</a><a href="/admin/reconciliation">Conciliação Asaas</a><a href="/admin/security">Segurança e sessões</a></>
          )}
          <a>Placas e NFC</a>
          <a href="/dashboard/analytics">Analytics</a>
          <a href="/dashboard/insights">Insights</a>
          <a>Equipe</a>
          <a href="/dashboard/billing">Plano e cobrança</a>
        </nav>
        <form action="/api/auth/logout" method="post">
          <input type="hidden" name="csrf" value={csrfToken(s.sessionTokenHash)} />
          <button>Sair</button>
        </form>
      </aside>
      <section>
        <header>
          <div>
            <small>VISÃO GERAL</small>
            <h1>{s.organizationName}</h1>
            <p className="dashboard-subtitle">O centro de controle da sua presença digital.</p>
          </div>
          <div className="profile">
            <span>{s.userName.charAt(0)}</span>
            <div>
              <b>{s.userName}</b>
              <small>{s.role}</small>
            </div>
          </div>
        </header>
        <div className="welcome dashboard-hero">
          <div><small>PÁGINA PUBLICADA</small><h2>Sua empresa em um toque.</h2><p>Centralize seus canais, informações e ofertas em uma experiência simples para seus clientes.</p><div className="hero-actions"><a href={`/p/${s.organizationSlug}`}>Ver página pública ↗</a><a className="hero-link" href="/dashboard/page-editor">Editar página</a></div></div>
          <div className="phone-preview"><b>{s.organizationName}</b><small>taplink</small><div>WhatsApp</div><div>Instagram</div><div>Como chegar</div></div>
        </div>
        <div className="dashboard-section-head"><div><small>DESEMPENHO</small><h2>O que está acontecendo</h2></div><a href="/dashboard/analytics">Ver relatório completo →</a></div>
        <div className="metrics">
          <article>
            <small>ACESSOS À PÁGINA</small><b>—</b><span>Configure o Analytics para acompanhar</span>
          </article>
          <article>
            <small>CLIQUES EM CANAIS</small><b>—</b><span>WhatsApp, Instagram, site e cardápio</span>
          </article>
          <article>
            <small>QR CODE / NFC</small><b>Ativo</b><span>Pronto para divulgar sua empresa</span>
          </article>
        </div>
        <div className="dashboard-grid"><div className="next-card setup-card">
          <div>
            <small>ATIVAÇÃO DA EMPRESA</small><h3>Deixe sua página completa</h3><p>Complete estas etapas para oferecer uma experiência profissional a quem escanear seu QR Code.</p><div className="progress-track"><span /></div><div className="setup-list">✓ Conta criada · ○ Dados da empresa · ○ Logo e cores · ○ WhatsApp e redes · ○ Localização · ○ Wi-Fi</div>
          </div>
          <a className="dashboard-cta" href="/dashboard/page-editor">
            Continuar configuração →
          </a>
        </div><div className="quick-card"><small>AÇÕES RÁPIDAS</small><h3>Gerencie sua presença</h3><a href="/dashboard/page-editor">✦ Editar página pública →</a><a href="/dashboard/page-editor#wifi">⌁ Configurar Wi-Fi →</a><a href="/dashboard/analytics">◌ Acompanhar analytics →</a></div></div>
      </section>
    </main>
  );
}
