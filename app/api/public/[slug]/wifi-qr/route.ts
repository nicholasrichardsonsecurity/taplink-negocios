import { eq } from "drizzle-orm";
import QRCode from "qrcode";
import { decryptSecret } from "@/lib/crypto/secrets";
import { buildWifiUri } from "@/lib/wifi";
import { db } from "@/packages/database/client";
import { publicPages } from "@/packages/database/schema";
import { consumeRateLimit, requestIp, securityHash } from "@/lib/security";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const rate = await consumeRateLimit({ scope: "public_wifi_qr", identity: securityHash(`${requestIp(request)}|${slug}`), limit: 15, windowMs: 60_000 });
  if (!rate.allowed) return Response.json({ error: "Muitas solicitações." }, { status: 429, headers: { "retry-after": String(rate.retryAfterSeconds) } });
  const [page] = await db
    .select()
    .from(publicPages)
    .where(eq(publicPages.slug, slug))
    .limit(1);
  if (!page?.published)
    return Response.json({ error: "Página não encontrada." }, { status: 404 });
  const settings = JSON.parse(page.publishedSettingsJson || "{}");
  const secrets = JSON.parse(page.publishedSecretsJson || "{}");
  if (!settings.wifiSsid || !secrets.wifiPassword)
    return Response.json({ error: "Wi-Fi não configurado." }, { status: 404 });
  const png = await QRCode.toBuffer(
    buildWifiUri(settings.wifiSsid, decryptSecret(secrets.wifiPassword)),
    { type: "png", width: 512, margin: 2, errorCorrectionLevel: "M" },
  );
  return new Response(new Blob([new Uint8Array(png)], { type: "image/png" }), {
    headers: {
      "content-type": "image/png",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}
