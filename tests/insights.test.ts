import test from "node:test";
import assert from "node:assert/strict";
import { buildDeterministicInsights, safeInsightSnapshot, type InsightSnapshot } from "../lib/insights";

const snapshot = (overrides: Partial<InsightSnapshot> = {}): InsightSnapshot => ({
  current: { views: 100, actions: 35, visitors: 80, conversion: 35 },
  previous: { views: 80, actions: 20, visitors: 60, conversion: 25 },
  byAction: [{ label: "Cardápio", value: 25 }],
  bySource: [{ label: "nfc", value: 70 }],
  ...overrides,
});

test("resume crescimento usando somente os números recebidos", () => {
  const report = buildDeterministicInsights(snapshot());
  assert.equal(report.headline, "Acessos cresceram 25%");
  assert.match(report.summary, /100 visualizações/);
  assert.match(report.summary, /Cardápio/);
});

test("recomenda avaliação quando ela não aparece nas ações", () => {
  const report = buildDeterministicInsights(snapshot());
  assert.ok(report.recommendations.some(item => /avaliação/i.test(item.title)));
});

test("prioriza chamada principal quando a conversão está baixa", () => {
  const report = buildDeterministicInsights(snapshot({ current: { views: 100, actions: 8, visitors: 70, conversion: 8 } }));
  assert.equal(report.recommendations[0].priority, "high");
});

test("snapshot seguro não inclui identificadores ou segredos de visitante", () => {
  const safe = JSON.stringify(safeInsightSnapshot(snapshot()));
  assert.doesNotMatch(safe, /visitorHash|wifi|password|ip|user-agent/i);
});
