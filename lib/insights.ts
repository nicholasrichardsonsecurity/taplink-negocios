export type InsightReport = {
  headline: string;
  summary: string;
  recommendations: { title: string; detail: string; priority: "high" | "medium" | "low" }[];
};

export type InsightSnapshot = {
  current: { views: number; actions: number; visitors: number; conversion: number };
  previous: { views: number; actions: number; visitors: number; conversion: number };
  byAction: { label: string; value: number }[];
  bySource: { label: string; value: number }[];
};

const variation = (current: number, previous: number) =>
  previous === 0 ? (current > 0 ? 100 : 0) : Math.round(((current - previous) / previous) * 100);

export function buildDeterministicInsights(snapshot: InsightSnapshot): InsightReport {
  const viewsChange = variation(snapshot.current.views, snapshot.previous.views);
  const topAction = snapshot.byAction[0];
  const topSource = snapshot.bySource[0];
  const recommendations: InsightReport["recommendations"] = [];

  if (snapshot.current.views === 0) {
    recommendations.push({ title: "Comece a medir os acessos", detail: "Teste a placa por NFC e QR Code e divulgue a página para formar a primeira base de comparação.", priority: "high" });
  } else if (snapshot.current.conversion < 20) {
    recommendations.push({ title: "Destaque a ação principal", detail: "Menos de 20% dos acessos viraram cliques. Coloque Cardápio, WhatsApp ou Avaliar entre os primeiros atalhos.", priority: "high" });
  }
  if (!snapshot.byAction.some((item) => /avali/i.test(item.label))) {
    recommendations.push({ title: "Facilite a avaliação no Google", detail: "Inclua Avaliar como atalho inferior para pedir feedback no melhor momento da experiência.", priority: "medium" });
  }
  if ((topSource?.label === "direct" || topSource?.label === "unknown") && snapshot.current.views > 0) {
    recommendations.push({ title: "Use links identificados", detail: "Prefira URLs com origem NFC ou QR para saber qual placa está trazendo visitas.", priority: "medium" });
  }
  if (recommendations.length === 0) {
    recommendations.push({ title: "Mantenha os atalhos vencedores", detail: `${topAction?.label ?? "A ação principal"} está liderando. Preserve a posição e teste apenas uma mudança por vez.`, priority: "low" });
  }

  return {
    headline: viewsChange >= 0 ? `Acessos cresceram ${viewsChange}%` : `Acessos recuaram ${Math.abs(viewsChange)}%`,
    summary: `${snapshot.current.views} visualizações e ${snapshot.current.actions} ações nos últimos 7 dias. ${topAction ? `${topAction.label} foi a ação mais usada.` : "Ainda não há uma ação líder."}`,
    recommendations: recommendations.slice(0, 3),
  };
}

export function safeInsightSnapshot(snapshot: InsightSnapshot) {
  return JSON.parse(JSON.stringify(snapshot)) as InsightSnapshot;
}
