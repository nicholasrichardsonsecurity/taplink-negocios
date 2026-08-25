import { getSessionContext } from "@/lib/auth/session";
import { analyticsDays, getAnalyticsReport } from "@/lib/analytics-report";

const csv = (value: unknown) => `"${String(value).replaceAll('"', '""')}"`;
export async function GET(request: Request) {
  const session = await getSessionContext();
  if (!session)
    return Response.json(
      { error: "Autenticação necessária." },
      { status: 401 },
    );
  const days = analyticsDays(new URL(request.url).searchParams.get("days"));
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
