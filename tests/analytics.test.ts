import test from "node:test";
import assert from "node:assert/strict";
import {
  analyticsDedupeKey,
  anonymousVisitorHash,
  normalizeAnalyticsSource,
} from "@/lib/analytics";

process.env.ANALYTICS_HASH_KEY =
  "test-analytics-key-with-more-than-32-characters";
test("anonimiza visitante e gira o hash diariamente", () => {
  const a = anonymousVisitorHash(
    "192.0.2.10",
    "browser",
    new Date("2026-08-25T10:00:00Z"),
  );
  const b = anonymousVisitorHash(
    "192.0.2.10",
    "browser",
    new Date("2026-08-26T10:00:00Z"),
  );
  assert.notEqual(a, b);
  assert.doesNotMatch(a, /192\.0\.2\.10|browser/);
});
test("deduplica o mesmo evento na janela de quinze minutos", () => {
  const input = {
    organizationId: "org",
    eventType: "page_view",
    visitorHash: "visitor",
  };
  const a = analyticsDedupeKey({
    ...input,
    date: new Date("2026-08-25T10:01:00Z"),
  });
  const b = analyticsDedupeKey({
    ...input,
    date: new Date("2026-08-25T10:14:00Z"),
  });
  const c = analyticsDedupeKey({
    ...input,
    date: new Date("2026-08-25T10:16:00Z"),
  });
  assert.equal(a, b);
  assert.notEqual(a, c);
});
test("normaliza origem não autorizada", () => {
  assert.equal(normalizeAnalyticsSource("nfc"), "nfc");
  assert.equal(normalizeAnalyticsSource("campanha-secreta"), "unknown");
});
