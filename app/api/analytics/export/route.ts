import { getSessionContext } from "@/lib/auth/session";
import { analyticsDays, getAnalyticsReport } from "@/lib/analytics-report";
import { getOrganizationEntitlements } from "@/lib/entitlements";
import { allowedAnalyticsDays } from "@/lib/billing";

const csv = (value: unknown) => `"${String(value).replaceAll('"', '""')}"`;
export async function GET(request: Request) {
  const session = await getSessionContext();
  if (!session)
    return Response.json(
      { error: "Autenticação necessária." },
      { status: 401 },
    );
  const entitlements = await getOrganizationEntitlements(session.organizationId);
  if (!entitlements.limits.csv) return Response.json({ error: "Exportação CSV não disponível no plano atual." }, { status: 403 });
  const days = allowedAnalyticsDays(analyticsDays(new URL(request.url).searchParams.get("days")), entitlements.limits.analyticsDays);
  const report = await getAnalyticsReport(session.organizationId, days);
  const lines = [
    ["data", "visualizacoes", "acoes"],
    ...report.daily.map((item) => [item.day, item.views, item.actions]),
  ].map((row) => row.map(csv).join(","));
  return new Response(`\uFEFF${lines.join("\n")}`, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="analytics-${session.organizationSlug}-${days}d.csv"`,
      "cache-control": "private, no-store",
    },
  });
}
