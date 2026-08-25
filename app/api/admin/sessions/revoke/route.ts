import { eq } from "drizzle-orm";
import { z } from "zod";
import { getSessionContext } from "@/lib/auth/session";
import { validCsrf } from "@/lib/security";
import { db } from "@/packages/database/client";
import { auditLogs, sessions, users } from "@/packages/database/schema";

const schema=z.object({userId:z.uuid(),reason:z.string().trim().min(5).max(300),confirmation:z.email().trim().toLowerCase()});
export async function POST(request:Request){const actor=await getSessionContext();if(!actor||actor.platformRole!=="platform_admin")return Response.json({error:"Acesso administrativo necessário."},{status:403});const form=await request.formData().catch(()=>new FormData());if(!validCsrf(request,actor.sessionTokenHash,form.get("csrf")))return Response.json({error:"Validação de segurança expirada."},{status:403});const parsed=schema.safeParse(Object.fromEntries(form));if(!parsed.success||parsed.data.userId===actor.userId)return Response.redirect(new URL("/admin/security?error=operação-inválida",request.url),303);const[user]=await db.select({email:users.email}).from(users).where(eq(users.id,parsed.data.userId)).limit(1);if(!user||user.email!==parsed.data.confirmation)return Response.redirect(new URL("/admin/security?error=confirmação-inválida",request.url),303);await db.transaction(async tx=>{const revoked=await tx.delete(sessions).where(eq(sessions.userId,parsed.data.userId)).returning({id:sessions.id});await tx.insert(auditLogs).values({actorUserId:actor.userId,action:"platform.sessions.revoked",entityType:"user",entityId:parsed.data.userId,metadataJson:JSON.stringify({reason:parsed.data.reason,revokedCount:revoked.length})})});return Response.redirect(new URL("/admin/security?revoked=1",request.url),303)}
