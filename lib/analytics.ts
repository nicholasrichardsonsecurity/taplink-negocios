import { createHmac } from "node:crypto";

export const analyticsActions = [
  "Cardápio",
  "Wi-Fi",
  "Avaliar",
  "WhatsApp",
  "Instagram",
  "Localização",
] as const;
export const analyticsSources = ["nfc", "qr", "direct", "unknown"] as const;
export type AnalyticsSource = (typeof analyticsSources)[number];

export function normalizeAnalyticsSource(value: unknown): AnalyticsSource {
  return analyticsSources.includes(value as AnalyticsSource)
    ? (value as AnalyticsSource)
    : "unknown";
}

function secret() {
  const value = process.env.ANALYTICS_HASH_KEY ?? process.env.SESSION_SECRET;
  if (!value || value.length < 32)
    throw new Error("ANALYTICS_HASH_KEY não configurada.");
  return value;
}
function digest(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

export function anonymousVisitorHash(
  ip: string,
  userAgent: string,
  date = new Date(),
) {
  const day = date.toISOString().slice(0, 10);
  return digest(`${day}|${ip}|${userAgent}`);
}

export function analyticsDedupeKey(input: {
  organizationId: string;
  eventType: string;
  action?: string | null;
  visitorHash: string;
  date?: Date;
}) {
  const date = input.date ?? new Date();
  const bucket = Math.floor(date.getTime() / (15 * 60 * 1000));
  return digest(
    `${input.organizationId}|${input.eventType}|${input.action ?? ""}|${input.visitorHash}|${bucket}`,
  );
}

export function clientIp(headers: Headers) {
  return (
    headers.get("x-forwarded-for")?.split(",")[0] ??
    headers.get("x-real-ip") ??
    "unknown"
  )
    .trim()
    .slice(0, 64);
}
