import {eq} from "drizzle-orm";
import {getSessionContext} from "@/lib/auth/session";
import {decryptSecret,encryptSecret} from "@/lib/crypto/secrets";
import {lisarojoDefaults,pageSettingsSchema} from "@/lib/page-settings";
import {db} from "@/packages/database/client";
import {auditLogs,publicPages} from "@/packages/database/schema";

export async function GET(){
 const session=await getSessionContext();if(!session)return Response.json({error:"Autenticação necessária."},{status:401});
 const [page]=await db.select().from(publicPages).where(eq(publicPages.organizationId,session.organizationId)).limit(1);
 if(!page)return Response.json({settings:lisarojoDefaults,published:false});
 const stored=JSON.parse(page.settingsJson||"{}");const secrets=JSON.parse(page.secretsJson||"{}");
 return Response.json({settings:{...lisarojoDefaults,...stored,wifiPassword:secrets.wifiPassword?decryptSecret(secrets.wifiPassword):""},published:page.published,updatedAt:page.updatedAt});
}

export async function PUT(request:Request){
 const session=await getSessionContext();if(!session)return Response.json({error:"Autenticação necessária."},{status:401});
 if(session.role==="analyst")return Response.json({error:"Seu perfil possui acesso somente para leitura."},{status:403});
 const body=await request.json().catch(()=>null) as {settings?:unknown;publish?:unknown}|null;
 const parsed=pageSettingsSchema.safeParse(body?.settings);
 if(!parsed.success)return Response.json({error:"Configurações inválidas.",issues:parsed.error.issues.map(issue=>({path:issue.path.join("."),message:issue.message}))},{status:400});
 const publish=body?.publish===true;const {wifiPassword,...publicSettings}=parsed.data;const now=new Date();
 await db.transaction(async tx=>{
  const [page]=await tx.select().from(publicPages).where(eq(publicPages.organizationId,session.organizationId)).limit(1);
  const draft={settingsJson:JSON.stringify(publicSettings),secretsJson:JSON.stringify({wifiPassword:encryptSecret(wifiPassword)}),updatedAt:now};
  const values=publish?{...draft,publishedSettingsJson:draft.settingsJson,publishedSecretsJson:draft.secretsJson,published:true,publishedAt:now}:draft;
  if(page)await tx.update(publicPages).set(values).where(eq(publicPages.id,page.id));
  else await tx.insert(publicPages).values({...values,organizationId:session.organizationId,slug:session.organizationSlug});
  await tx.insert(auditLogs).values({organizationId:session.organizationId,actorUserId:session.userId,action:publish?"public_page.published":"public_page.saved",entityType:"public_page",entityId:page?.id,metadataJson:JSON.stringify({changedSections:["identity","links","wifi","shortcuts","sections"]})});
 });
 return Response.json({ok:true,published:publish,updatedAt:now.toISOString()});
}
