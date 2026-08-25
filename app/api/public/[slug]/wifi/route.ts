import {eq} from "drizzle-orm";
import {decryptSecret} from "@/lib/crypto/secrets";
import {db} from "@/packages/database/client";
import {publicPages} from "@/packages/database/schema";

export async function GET(_request:Request,{params}:{params:Promise<{slug:string}>}){const {slug}=await params;const [page]=await db.select({published:publicPages.published,secrets:publicPages.publishedSecretsJson}).from(publicPages).where(eq(publicPages.slug,slug)).limit(1);if(!page?.published)return Response.json({error:"Página não publicada."},{status:404});const secrets=JSON.parse(page.secrets||"{}");return Response.json({password:secrets.wifiPassword?decryptSecret(secrets.wifiPassword):""},{headers:{"Cache-Control":"private, no-store"}})}
