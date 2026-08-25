import { eq } from "drizzle-orm";
import { decryptSecret } from "@/lib/crypto/secrets";
import { db } from "@/packages/database/client";
import { publicPages } from "@/packages/database/schema";
import { consumeRateLimit, requestIp, securityHash } from "@/lib/security";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const rate = await consumeRateLimit({ scope: "public_wifi", identity: securityHash(`${requestIp(request)}|${slug}`), limit: 30, windowMs: 60_000 });
  if (!rate.allowed) return Response.json({ error: "Muitas solicitações." }, { status: 429, headers: { "retry-after": String(rate.retryAfterSeconds) } });
  const [page] = await db
    .select({
      published: publicPages.published,
      secrets: publicPages.publishedSecretsJson,
    })
    .from(publicPages)
    .where(eq(publicPages.slug, slug))
    .limit(1);
  if (!page?.published)
    return Response.json({ error: "Página não publicada." }, { status: 404 });
  const secrets = JSON.parse(page.secrets || "{}");
  return Response.json(
    {
      password: secrets.wifiPassword ? decryptSecret(secrets.wifiPassword) : "",
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
