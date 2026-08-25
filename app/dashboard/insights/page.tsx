import { requireSession } from "@/lib/auth/session";
import { getInsightDashboard } from "@/lib/insight-service";

const priority = { high: "Alta", medium: "Média", low: "Baixa" };
const statusName: Record<string, string> = { generated: "Aguardando aprovação", fallback: "Regras locais", approved: "Aprovado", rejected: "Rejeitado" };

export default async function InsightsPage() {
  const session = await requireSession();
  const data = await getInsightDashboard(session.organizationId);
  const latest = data.runs[0];
  const canManage = ['owner', 'manager'].includes(session.role);
  return <main className="insights-page">
    <header><div><a href="/dashboard">← Visão geral</a><small>INTELIGÊNCIA RESPONSÁVEL</small><h1>Insights de {session.organizationName}</h1><p>Recomendações baseadas somente em métricas agregadas dos últimos 7 dias.</p></div></header>
    <section className="insight-hero"><div><small>RESUMO DA SEMANA</small><h2>{data.report.headline}</h2><p>{data.report.summary}</p></div><form action="/api/insights/generate" method="post"><button disabled={!canManage}>Atualizar análise</button><span>{data.settings.enabled ? "IA opcional autorizada" : "Motor local ativo"}</span></form></section>
    <section className="insight-grid">
      <article className="recommendations"><small>PRÓXIMAS AÇÕES</small><h2>O que vale testar</h2>{data.report.recommendations.map((item, index) => <div key={item.title}><b>{index + 1}</b><span><em>{priority[item.priority]}</em><strong>{item.title}</strong><p>{item.detail}</p></span></div>)}</article>
      <article className="evidence"><small>EVIDÊNCIAS</small><h2>Números usados</h2><dl><div><dt>Visualizações</dt><dd>{data.snapshot.current.views}</dd></div><div><dt>Ações</dt><dd>{data.snapshot.current.actions}</dd></div><div><dt>Conversão</dt><dd>{data.snapshot.current.conversion}%</dd></div><div><dt>Período anterior</dt><dd>{data.snapshot.previous.views} acessos</dd></div></dl><p>Nenhum IP, hash de visitante, senha ou dado pessoal é enviado ao modelo.</p></article>
    </section>
    {latest && <section className="review-card"><div><small>CONTROLE HUMANO</small><h2>{statusName[latest.status] ?? latest.status}</h2><p>Origem: {latest.provider === 'openai' ? `OpenAI · ${latest.model}` : 'regras determinísticas'} · {latest.inputTokens + latest.outputTokens} tokens</p></div>{latest.status === 'generated' && canManage && <form action={`/api/insights/${latest.id}/review`} method="post"><button name="decision" value="reject">Rejeitar</button><button className="approve" name="decision" value="approve">Aprovar</button></form>}</section>}
    <section className="ai-settings"><div><small>ORÇAMENTO POR EMPRESA</small><h2>IA opcional</h2><p>A análise local é gratuita e permanece disponível mesmo sem provedor externo.</p></div><form action="/api/insights/settings" method="post"><label><input type="checkbox" name="enabled" defaultChecked={data.settings.enabled} disabled={session.role !== 'owner'} /> Permitir complemento generativo</label><label>Requisições/mês<input name="requestLimit" type="number" min="1" max="100" defaultValue={data.settings.monthlyRequestLimit} disabled={session.role !== 'owner'} /></label><label>Tokens/mês<input name="tokenLimit" type="number" min="1000" max="500000" step="1000" defaultValue={data.settings.monthlyTokenLimit} disabled={session.role !== 'owner'} /></label><span>Uso: {data.usage.requests}/{data.settings.monthlyRequestLimit} análises · {data.usage.tokens}/{data.settings.monthlyTokenLimit} tokens</span>{session.role === 'owner' && <button>Salvar limites</button>}</form></section>
  </main>;
}
