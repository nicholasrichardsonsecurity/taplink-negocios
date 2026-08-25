import {count,eq,sql} from "drizzle-orm";
import {db} from "@/packages/database/client";
import {auditLogs,memberships,organizations,publicPages,users} from "@/packages/database/schema";
import {hashPassword} from "@/lib/auth/password";
import {bootstrapSchema} from "@/lib/validation";

export async function POST(request:Request){
 const parsed=bootstrapSchema.safeParse(await request.json().catch(()=>null));
 if(!parsed.success)return Response.json({error:"Dados de inicialização inválidos."},{status:400});
 if(!process.env.BOOTSTRAP_TOKEN||parsed.data.bootstrapToken!==process.env.BOOTSTRAP_TOKEN)return Response.json({error:"Inicialização não autorizada."},{status:403});
 const passwordHash=await hashPassword(parsed.data.password);
 const result=await db.transaction(async tx=>{
  await tx.execute(sql`select pg_advisory_xact_lock(74615011)`);
  const [{value}]=await tx.select({value:count()}).from(users);
  if(value>0)return "already_initialized" as const;
  const existing=await tx.select({id:organizations.id}).from(organizations).where(eq(organizations.slug,parsed.data.organizationSlug)).limit(1);
  if(existing.length)return "slug_unavailable" as const;
  const [organization]=await tx.insert(organizations).values({name:parsed.data.organizationName,slug:parsed.data.organizationSlug,status:"active"}).returning();
  const [user]=await tx.insert(users).values({name:parsed.data.name,email:parsed.data.email,passwordHash}).returning();
  await tx.insert(memberships).values({organizationId:organization.id,userId:user.id,role:"owner"});
  await tx.insert(publicPages).values({organizationId:organization.id,slug:organization.slug});
  await tx.insert(auditLogs).values({organizationId:organization.id,actorUserId:user.id,action:"system.bootstrapped",entityType:"organization",entityId:organization.id});
  return "created" as const;
 });
 if(result==="already_initialized")return Response.json({error:"Inicialização já concluída."},{status:409});
 if(result==="slug_unavailable")return Response.json({error:"Identificador de empresa indisponível."},{status:409});
 return Response.json({ok:true},{status:201});
}
