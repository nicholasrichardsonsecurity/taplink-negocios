import test,{after} from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {eq} from "drizzle-orm";
import {db,sql} from "../packages/database/client";
import {analyticsEvents,auditLogs,billingPayments,billingPlans,memberships,organizationSubscriptions,organizations,passwordResetTokens,publicPages,sessions,users} from "../packages/database/schema";
import {getTenantMembership,requireTenantMembership} from "../packages/database/tenant";
import {hashPassword} from "../lib/auth/password";
import {decryptSecret} from "../lib/crypto/secrets";
import {processAsaasWebhook} from "../lib/billing-service";
import {applySubscriptionAdminAction} from "../lib/admin-billing-service";
import {consumePasswordReset} from "../lib/password-reset";
import {consumeRateLimit,createResetToken,hashResetToken} from "../lib/security";
import {verifyPassword} from "../lib/auth/password";

after(()=>sql.end());

test("isola um usuário de outra empresa",async t=>{
 const suffix=crypto.randomUUID().slice(0,8);
 const [orgA]=await db.insert(organizations).values({name:"Empresa A",slug:`empresa-a-${suffix}`,status:"active"}).returning();
 const [orgB]=await db.insert(organizations).values({name:"Empresa B",slug:`empresa-b-${suffix}`,status:"active"}).returning();
 const [userA]=await db.insert(users).values({name:"Proprietário A",email:`owner-a-${suffix}@example.test`,passwordHash:await hashPassword("senha-de-integracao-123")}).returning();
 await db.insert(memberships).values({organizationId:orgA.id,userId:userA.id,role:"owner"});
 t.after(async()=>{await db.delete(organizations).where(eq(organizations.id,orgA.id));await db.delete(organizations).where(eq(organizations.id,orgB.id));await db.delete(users).where(eq(users.id,userA.id))});
 const own=await getTenantMembership(userA.id,orgA.id);
 const foreign=await getTenantMembership(userA.id,orgB.id);
 assert.equal(own?.organizationId,orgA.id);
 assert.equal(own?.role,"owner");
 assert.equal(foreign,null);
 await assert.rejects(()=>requireTenantMembership(userA.id,orgB.id),/TENANT_ACCESS_DENIED/);
});

test("mantém rascunho separado da versão publicada e cifra o Wi-Fi",async()=>{const [page]=await db.select().from(publicPages).where(eq(publicPages.slug,"empresa-ci")).limit(1);assert.ok(page);assert.equal(JSON.parse(page.settingsJson).tagline,"Alteração ainda em rascunho.");assert.equal(JSON.parse(page.publishedSettingsJson).tagline,"Sabor publicado pelo CI.");assert.doesNotMatch(page.secretsJson,/senha-wifi-ci/);assert.doesNotMatch(page.publishedSecretsJson,/senha-wifi-ci/);assert.equal(decryptSecret(JSON.parse(page.publishedSecretsJson).wifiPassword),"senha-wifi-ci")});
test("deduplica analytics e não persiste endereço ou user-agent",async()=>{const rows=await db.select().from(analyticsEvents);assert.equal(rows.filter(row=>row.eventType==="page_view").length,1);assert.equal(rows.filter(row=>row.action==="Avaliar").length,1);assert.doesNotMatch(JSON.stringify(rows),/192\.0\.2\.20|taplink-ci-browser/)});

test("processa webhook Asaas de forma idempotente e isolada",async t=>{
 process.env.ASAAS_WEBHOOK_SECRET="webhook-integration-secret-with-at-least-32-chars";
 const suffix=crypto.randomUUID().slice(0,8);
 const [org]=await db.insert(organizations).values({name:"Billing CI",slug:`billing-ci-${suffix}`,status:"active"}).returning();
 t.after(async()=>{await db.delete(organizations).where(eq(organizations.id,org.id))});
 const [plan]=await db.select().from(billingPlans).where(eq(billingPlans.code,"essencial")).limit(1);assert.ok(plan);
 const [subscription]=await db.insert(organizationSubscriptions).values({organizationId:org.id,planId:plan.id,status:"trial",providerSubscriptionId:`sub_${suffix}`,providerCustomerId:`cus_${suffix}`,trialEndsAt:new Date(Date.now()+86400000)}).returning();
 const raw=JSON.stringify({id:`evt_${suffix}`,event:"PAYMENT_RECEIVED",payment:{id:`pay_${suffix}`,subscription:`sub_${suffix}`,value:39.9,dueDate:"2026-09-08",paymentDate:"2026-09-08",invoiceUrl:"https://sandbox.asaas.com/i/teste"}});
 const first=await processAsaasWebhook(raw,process.env.ASAAS_WEBHOOK_SECRET);const duplicate=await processAsaasWebhook(raw,process.env.ASAAS_WEBHOOK_SECRET);
 assert.equal(first.status,200);assert.equal("duplicate" in duplicate.body&&duplicate.body.duplicate,true);
 const payments=await db.select().from(billingPayments).where(eq(billingPayments.subscriptionId,subscription.id));assert.equal(payments.length,1);assert.equal(payments[0].status,"received");
 const [updated]=await db.select().from(organizationSubscriptions).where(eq(organizationSubscriptions.id,subscription.id));assert.equal(updated.status,"active");
});

test("altera plano interno com confirmação operacional auditável",async t=>{
 const suffix=crypto.randomUUID().slice(0,8);
 const [org]=await db.insert(organizations).values({name:"Admin Billing CI",slug:`admin-billing-${suffix}`,status:"trial"}).returning();
 const [actor]=await db.insert(users).values({name:"Administrador CI",email:`admin-billing-${suffix}@example.test`,passwordHash:await hashPassword("senha-de-integracao-123"),platformRole:"platform_admin"}).returning();
 t.after(async()=>{await db.delete(organizations).where(eq(organizations.id,org.id));await db.delete(users).where(eq(users.id,actor.id))});
 const [essential]=await db.select().from(billingPlans).where(eq(billingPlans.code,"essencial")).limit(1);
 const [business]=await db.select().from(billingPlans).where(eq(billingPlans.code,"negocios")).limit(1);
 const [subscription]=await db.insert(organizationSubscriptions).values({organizationId:org.id,planId:essential.id,status:"trial"}).returning();
 await applySubscriptionAdminAction({actorUserId:actor.id,organizationId:org.id,action:"change_plan",planCode:"negocios",reason:"Ajuste aprovado no teste de integração"});
 const [updated]=await db.select().from(organizationSubscriptions).where(eq(organizationSubscriptions.id,subscription.id));
 assert.equal(updated.planId,business.id);
 const [audit]=await db.select().from(auditLogs).where(eq(auditLogs.entityId,subscription.id));
 assert.equal(audit.action,"platform.billing.change_plan");
 assert.match(audit.metadataJson,/Ajuste aprovado/);
});

test("limita tentativas de forma persistente entre requisições",async()=>{
 const identity=crypto.randomUUID();
 const first=await consumeRateLimit({scope:"integration",identity,limit:2,windowMs:60000});
 const second=await consumeRateLimit({scope:"integration",identity,limit:2,windowMs:60000});
 const third=await consumeRateLimit({scope:"integration",identity,limit:2,windowMs:60000});
 assert.equal(first.allowed,true);assert.equal(second.allowed,true);assert.equal(third.allowed,false);
});

test("redefine senha uma vez e revoga todas as sessões",async t=>{
 const suffix=crypto.randomUUID().slice(0,8),token=createResetToken();
 const [user]=await db.insert(users).values({name:"Reset CI",email:`reset-${suffix}@example.test`,passwordHash:await hashPassword("senha-antiga-123")}).returning();
 t.after(async()=>{await db.delete(users).where(eq(users.id,user.id))});
 await db.insert(sessions).values({userId:user.id,tokenHash:createHash("sha256").update(`session-${suffix}`).digest("hex"),expiresAt:new Date(Date.now()+86400000)});
 await db.insert(passwordResetTokens).values({userId:user.id,tokenHash:hashResetToken(token),expiresAt:new Date(Date.now()+60000)});
 assert.equal(await consumePasswordReset(token,"senha-nova-segura-123"),true);
 assert.equal(await consumePasswordReset(token,"outra-senha-segura-123"),false);
 const [updated]=await db.select().from(users).where(eq(users.id,user.id));assert.equal(await verifyPassword("senha-nova-segura-123",updated.passwordHash),true);
 assert.equal((await db.select().from(sessions).where(eq(sessions.userId,user.id))).length,0);
});
