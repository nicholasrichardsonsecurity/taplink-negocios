import assert from "node:assert/strict";

const url=process.env.APP_URL??"http://127.0.0.1:3000";
const bootstrapToken=process.env.BOOTSTRAP_TOKEN;
assert.ok(bootstrapToken,"BOOTSTRAP_TOKEN ausente");
const credentials={email:"owner-ci@example.test",password:"senha-ci-segura-123"};

const bootstrap=await fetch(`${url}/api/auth/bootstrap`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({...credentials,name:"Owner CI",organizationName:"Empresa CI",organizationSlug:"empresa-ci",bootstrapToken})});
assert.equal(bootstrap.status,201,`Bootstrap falhou: ${await bootstrap.text()}`);

const repeated=await fetch(`${url}/api/auth/bootstrap`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({...credentials,name:"Outro Owner",organizationName:"Outra Empresa",organizationSlug:"outra-empresa",bootstrapToken})});
assert.equal(repeated.status,409,"Bootstrap deveria ser de uso único");

const invalid=await fetch(`${url}/api/auth/login`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({...credentials,password:"senha-incorreta-123"})});
assert.equal(invalid.status,401,"Senha incorreta deveria ser rejeitada");

const resetRequest=await fetch(`${url}/api/auth/password-reset/request`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email:"conta-inexistente@example.test"})});assert.equal(resetRequest.status,200);assert.match((await resetRequest.json()).message,/Se o e-mail estiver cadastrado/);

const login=await fetch(`${url}/api/auth/login`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(credentials)});
assert.equal(login.status,200,`Login falhou: ${await login.text()}`);
const cookie=login.headers.get("set-cookie")?.split(";",1)[0];
assert.ok(cookie?.startsWith("taplink_session="),"Cookie de sessão não foi emitido");

const dashboard=await fetch(`${url}/dashboard`,{headers:{cookie},redirect:"manual"});
assert.equal(dashboard.status,200,"Dashboard protegido não abriu com a sessão");
const html=await dashboard.text();
assert.match(html,/Empresa CI/);
assert.match(html,/Owner CI/);

const anonymous=await fetch(`${url}/dashboard`,{redirect:"manual"});
assert.equal(anonymous.status,307,"Acesso anônimo deveria redirecionar");
assert.equal(anonymous.headers.get("location"),"/login");

const settings={businessName:"Pizzaria Lisarojo CI",category:"Restaurante e pizzaria",tagline:"Sabor publicado pelo CI.",description:"Experiência white-label validada automaticamente.",logoUrl:"",primaryColor:"#a9362d",secondaryColor:"#d56b35",whatsapp:"81986708073",instagram:"pizzarialisarojo",googleReviewUrl:"https://example.com/google-review",menuUrl:"https://example.com/cardapio",locationUrl:"https://example.com/local",wifiSsid:"LISAROJO_CI",wifiPassword:"senha-wifi-ci",shortcuts:["Cardápio","Avaliar","Wi-Fi"],showPromo:true,showAbout:true,showLocation:true};
const publish=await fetch(`${url}/api/page-settings`,{method:"PUT",headers:{"content-type":"application/json",cookie},body:JSON.stringify({settings,publish:true})});
assert.equal(publish.status,200,`Publicação falhou: ${await publish.text()}`);
const publicPage=await fetch(`${url}/p/empresa-ci`);assert.equal(publicPage.status,200);const publishedHtml=await publicPage.text();assert.match(publishedHtml,/Sabor publicado pelo CI/);assert.doesNotMatch(publishedHtml,/senha-wifi-ci/);
const wifi=await fetch(`${url}/api/public/empresa-ci/wifi`);assert.equal(wifi.status,200);assert.equal((await wifi.json()).password,"senha-wifi-ci");
const wifiQr=await fetch(`${url}/api/public/empresa-ci/wifi-qr`);assert.equal(wifiQr.status,200);assert.equal(wifiQr.headers.get("content-type"),"image/png");const qrBytes=new Uint8Array(await wifiQr.arrayBuffer());assert.deepEqual([...qrBytes.slice(0,8)],[137,80,78,71,13,10,26,10]);
const eventHeaders={"content-type":"application/json","user-agent":"taplink-ci-browser","x-forwarded-for":"192.0.2.20"};const pageEvent={eventType:"page_view",source:"nfc"};const firstEvent=await fetch(`${url}/api/public/empresa-ci/events`,{method:"POST",headers:eventHeaders,body:JSON.stringify(pageEvent)});assert.equal(firstEvent.status,202);await fetch(`${url}/api/public/empresa-ci/events`,{method:"POST",headers:eventHeaders,body:JSON.stringify(pageEvent)});const actionEvent=await fetch(`${url}/api/public/empresa-ci/events`,{method:"POST",headers:eventHeaders,body:JSON.stringify({eventType:"action_click",action:"Avaliar",source:"nfc"})});assert.equal(actionEvent.status,202);
const analytics=await fetch(`${url}/dashboard/analytics?days=90`,{headers:{cookie}});assert.equal(analytics.status,200);const analyticsHtml=await analytics.text();assert.match(analyticsHtml,/Eventos anônimos/);assert.match(analyticsHtml,/Avaliar/);assert.doesNotMatch(analyticsHtml,/>90 dias</);const csvExport=await fetch(`${url}/api/analytics/export?days=30`,{headers:{cookie}});assert.equal(csvExport.status,403,"CSV deve respeitar o plano no backend");
const billing=await fetch(`${url}/dashboard/billing`,{headers:{cookie}});assert.equal(billing.status,200);const billingHtml=await billing.text();assert.match(billingHtml,/R\$ 39,90|R\$ 39,90/);assert.match(billingHtml,/ambiente sandbox/);
const operations=await fetch(`${url}/admin/operations`,{headers:{cookie}});assert.equal(operations.status,200);const operationsHtml=await operations.text();assert.match(operationsHtml,/Controle sem planilha paralela/);assert.match(operationsHtml,/Empresa CI/);
const securityAdmin=await fetch(`${url}/admin/security`,{headers:{cookie}});assert.equal(securityAdmin.status,200);assert.match(await securityAdmin.text(),/Sessões sob controle/);
const csrfBlocked=await fetch(`${url}/api/admin/billing`,{method:"POST",headers:{cookie,"content-type":"application/x-www-form-urlencoded",origin:url},body:new URLSearchParams({organizationId:"00000000-0000-0000-0000-000000000000",action:"cancel",reason:"tentativa sem csrf",confirmation:"empresa-ci"}),redirect:"manual"});assert.equal(csrfBlocked.status,403,"Operação financeira sem CSRF deveria ser bloqueada");
const draftSettings={...settings,tagline:"Alteração ainda em rascunho."};
const draft=await fetch(`${url}/api/page-settings`,{method:"PUT",headers:{"content-type":"application/json",cookie},body:JSON.stringify({settings:draftSettings,publish:false})});assert.equal(draft.status,200);
const editorState=await fetch(`${url}/api/page-settings`,{headers:{cookie}});assert.equal((await editorState.json()).settings.tagline,"Alteração ainda em rascunho.");
const stillPublished=await fetch(`${url}/p/empresa-ci`);const stillPublishedHtml=await stillPublished.text();assert.match(stillPublishedHtml,/Sabor publicado pelo CI/);assert.doesNotMatch(stillPublishedHtml,/Alteração ainda em rascunho/);
const createCompany=await fetch(`${url}/api/admin/companies`,{method:"POST",headers:{"content-type":"application/json",cookie},body:JSON.stringify({name:"Segunda Empresa CI",slug:"segunda-empresa-ci"})});assert.equal(createCompany.status,201,"Cadastro de empresa falhou");const secondCompany=(await createCompany.json()).company;
const companies=await fetch(`${url}/api/admin/companies`,{headers:{cookie}});const companyList=(await companies.json()).companies;const firstCompany=companyList.find(company=>company.slug==="empresa-ci");assert.ok(firstCompany);
const switchCompany=await fetch(`${url}/api/session/organization`,{method:"POST",headers:{"content-type":"application/json",cookie},body:JSON.stringify({organizationId:secondCompany.id})});assert.equal(switchCompany.status,200);
const secondDashboard=await fetch(`${url}/dashboard`,{headers:{cookie}});assert.match(await secondDashboard.text(),/Segunda Empresa CI/);
await fetch(`${url}/api/session/organization`,{method:"POST",headers:{"content-type":"application/json",cookie},body:JSON.stringify({organizationId:firstCompany.id})});
console.log("Bootstrap, login, editor, QR Wi-Fi, rascunho, administração e troca de empresa validados.");
