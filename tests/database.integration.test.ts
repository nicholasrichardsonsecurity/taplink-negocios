import test,{after} from "node:test";
import assert from "node:assert/strict";
import {eq} from "drizzle-orm";
import {db,sql} from "../packages/database/client";
import {analyticsEvents,memberships,organizations,publicPages,users} from "../packages/database/schema";
import {getTenantMembership,requireTenantMembership} from "../packages/database/tenant";
import {hashPassword} from "../lib/auth/password";
import {decryptSecret} from "../lib/crypto/secrets";

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
