import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "@/packages/database/client";
import { securityRateLimits } from "@/packages/database/schema";

function secret() {
  const value = process.env.RATE_LIMIT_SECRET || process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("SECURITY_SECRET_NOT_CONFIGURED");
  return value;
}

export function securityHash(value: string) { return createHmac("sha256", secret()).update(value).digest("hex"); }
export const hashResetToken = (token: string) => createHash("sha256").update(token).digest("hex");
export const createResetToken = () => randomBytes(32).toString("base64url");
export const csrfToken = (sessionTokenHash: string) => securityHash(`csrf|${sessionTokenHash}`);

export function validCsrf(request: Request, sessionTokenHash: string, submitted: unknown) {
  if (typeof submitted !== "string") return false;
  const expectedOrigin = process.env.APP_URL;
  const origin = request.headers.get("origin");
  if (expectedOrigin && origin) {
    try { if (new URL(origin).origin !== new URL(expectedOrigin).origin) return false; } catch { return false; }
  }
  const expected = Buffer.from(csrfToken(sessionTokenHash));
  const received = Buffer.from(submitted);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export async function consumeRateLimit(input: { scope: string; identity: string; limit: number; windowMs: number; now?: Date }) {
  const now = input.now ?? new Date();
  const bucket = Math.floor(now.getTime() / input.windowMs);
  const keyHash = securityHash(`${input.scope}|${input.identity}|${bucket}`);
  const expiresAt = new Date((bucket + 1) * input.windowMs);
  const [row] = await db.insert(securityRateLimits).values({ keyHash, scope: input.scope, expiresAt })
    .onConflictDoUpdate({ target: securityRateLimits.keyHash, set: { attempts: sql`${securityRateLimits.attempts} + 1`, updatedAt: now } }).returning({ attempts: securityRateLimits.attempts });
  return { allowed: row.attempts <= input.limit, remaining: Math.max(0, input.limit - row.attempts), retryAfterSeconds: Math.max(1, Math.ceil((expiresAt.getTime() - now.getTime()) / 1000)) };
}

export function requestIp(request: Request) { return (request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "unknown").trim().slice(0, 64); }
