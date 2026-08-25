import { requireSession } from "@/lib/auth/session";
import { analyticsDays, getAnalyticsReport } from "@/lib/analytics-report";
import { getOrganizationEntitlements } from "@/lib/entitlements";
import { allowedAnalyticsDays } from "@/lib/billing";

const sourceNames: Record<string, string> = {
  nfc: "NFC",
  qr: "QR Code",
  direct: "Direto",
  unknown: "Não identificado",
};
export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const session = await requireSession();
  const entitlements = await getOrganizationEntitlements(session.organizationId);
  const days = allowedAnalyticsDays(analyticsDays((await searchParams).days), entitlements.limits.analyticsDays);
  const report = await getAnalyticsReport(session.organizationId, days);
  const max = Math.max(1, ...report.daily.map((item) => item.views));
  return (
    <main className="analytics-page">
      <header>
        <div>
          <a href="/dashboard">← Visão geral</a>
          <small>EMPRESA ATIVA</small>
          <h1>Analytics de {session.organizationName}</h1>
          <p>Eventos anônimos, deduplicados e sem armazenamento de IP.</p>
        </div>
        <nav>
          {[7, 30, 90].filter(value => value <= entitlements.limits.analyticsDays).map((value) => (
            <a
              key={value}
              className={days === value ? "active" : ""}
              href={`/dashboard/analytics?days=${value}`}
            >
              {value} dias
            </a>
          ))}
          {entitlements.limits.csv && <a href={`/api/analytics/export?days=${days}`}>Exportar CSV</a>}
        </nav>
      </header>
      <section className="analytics-metrics">
        <Metric label="VISUALIZAÇÕES" value={report.totals.views} />
        <Metric label="VISITANTES ÚNICOS" value={report.totals.visitors} />
        <Metric label="AÇÕES" value={report.totals.actions} />
        <Metric label="AÇÕES / VISITA" value={`${report.totals.conversion}%`} />
      </section>
      <section className="analytics-grid">
        <article className="analytics-chart">
          <div>
            <small>ACESSOS POR DIA</small>
            <h2>Movimento da página</h2>
          </div>
          <div className="bar-chart">
            {report.daily.map((item) => (
              <span key={item.day} title={`${item.day}: ${item.views} acessos`}>
                <i
                  style={{
                    height: `${Math.max(3, (item.views / max) * 100)}%`,
                  }}
                />
                <small>{item.day.slice(8)}</small>
              </span>
            ))}
          </div>
        </article>
        <List
          title="Ações mais usadas"
          empty="Nenhum clique registrado"
          items={report.byAction}
        />
        <List
          title="Origem dos acessos"
          empty="Nenhuma origem registrada"
          items={report.bySource.map((item) => ({
            ...item,
            label: sourceNames[item.label] ?? item.label,
          }))}
        />
      </section>
      <footer>
        Os identificadores anônimos giram diariamente. Eventos repetidos na
        mesma janela de 15 minutos não inflam os números.
      </footer>
    </main>
  );
}
function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <article>
      <small>{label}</small>
      <b>{value}</b>
    </article>
  );
}
function List({
  title,
  items,
  empty,
}: {
  title: string;
  items: { label: string; value: number }[];
  empty: string;
}) {
  const max = Math.max(1, ...items.map((item) => item.value));
  return (
    <article className="analytics-list">
      <small>DESEMPENHO</small>
      <h2>{title}</h2>
      {items.length === 0 ? (
        <p>{empty}</p>
      ) : (
        items.map((item) => (
          <div key={item.label}>
            <span>
              <b>{item.label}</b>
              <em>{item.value}</em>
            </span>
            <i>
              <u style={{ width: `${(item.value / max) * 100}%` }} />
            </i>
          </div>
        ))
      )}
    </article>
  );
}
