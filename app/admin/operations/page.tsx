import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { getPlatformOperations } from "@/lib/admin-billing-service";
import { money } from "@/lib/billing";

const labels: Record<string, string> = { trial: "Trial", pending: "Pendente", active: "Ativa", past_due: "Em atraso", suspended: "Suspensa", cancelled: "Cancelada" };

export default async function OperationsPage({ searchParams }: { searchParams: Promise<{ updated?: string; error?: string }> }) {
  const session = await requireSession();
  if (session.platformRole !== "platform_admin") redirect("/dashboard");
  const [data, query] = await Promise.all([getPlatformOperations(), searchParams]);
  return <main className="ops-page">
    <header><div><a href="/dashboard">← Painel</a><small>OPERAÇÃO DA PLATAFORMA</small><h1>Controle sem planilha paralela.</h1><p>Assinaturas, inadimplência, integrações e decisões administrativas em uma única visão.</p></div><a href="/admin/companies">Cadastrar empresa</a></header>
    {query.updated && <p className="ops-alert success">Operação concluída e registrada na auditoria.</p>}
    {query.error && <p className="ops-alert error">Operação não concluída: {query.error}. Nenhuma alteração parcial local foi aplicada.</p>}
    <section className="ops-metrics"><Metric label="EMPRESAS" value={data.metrics.companies}/><Metric label="ATIVAS" value={data.metrics.active}/><Metric label="RECEBIDO NO HISTÓRICO" value={money(data.metrics.revenueCents)}/><Metric label="WEBHOOKS COM ALERTA" value={data.metrics.failedWebhooks}/></section>
    <section className="ops-grid">
      <article className="ops-companies"><div><small>CARTEIRA</small><h2>Empresas e assinaturas</h2></div>{data.companies.map(item => <details key={item.organization.id}>
        <summary><span><b>{item.organization.name}</b><small>{item.organization.slug} · {item.memberCount} usuário(s)</small></span><span><strong>{item.plan?.name ?? "Sem plano"}</strong><i className={`status ${item.subscription?.status ?? item.organization.status}`}>{labels[item.subscription?.status ?? item.organization.status] ?? item.organization.status}</i></span></summary>
        {item.subscription ? <form action="/api/admin/billing" method="post"><input type="hidden" name="organizationId" value={item.organization.id}/><label>Ação<select name="action" required><option value="change_plan">Alterar plano</option><option value="suspend">Suspender temporariamente</option><option value="reactivate">Reativar</option><option value="cancel">Cancelar definitivamente</option></select></label><label>Novo plano<select name="planCode" defaultValue={item.plan?.code}><option value="essencial">Essencial</option><option value="negocios">Negócios</option><option value="premium">Premium</option></select></label><label>Motivo<input name="reason" minLength={5} maxLength={300} required placeholder="Motivo auditável da alteração"/></label><label>Confirme com <code>{item.organization.slug}</code><input name="confirmation" required autoComplete="off"/></label><button>Executar no sandbox</button><p>Alterações externas são enviadas primeiro ao Asaas. Se o provedor falhar, o estado local não muda.</p></form> : <p className="ops-empty">A empresa ainda não possui assinatura.</p>}
      </details>)}</article>
      <article className="ops-webhooks"><div><small>INTEGRAÇÕES</small><h2>Últimos webhooks</h2></div>{data.webhooks.length ? data.webhooks.map(event => <div key={event.id}><span><b>{event.eventType}</b><small>{event.receivedAt.toLocaleString("pt-BR")}</small></span><span><i className={event.errorCode ? "status past_due" : "status active"}>{event.errorCode ?? (event.processed ? "Processado" : "Pendente")}</i><small>{event.providerEventId.slice(0, 20)}</small></span></div>) : <p>Nenhum webhook recebido.</p>}</article>
    </section>
    <footer>Ambiente restrito ao Asaas sandbox. Cancelamento remove a recorrência no provedor e exige confirmação nominal; nenhum conteúdo público é apagado automaticamente.</footer>
  </main>;
}
function Metric({ label, value }: { label: string; value: string | number }) { return <article><small>{label}</small><b>{value}</b></article>; }
