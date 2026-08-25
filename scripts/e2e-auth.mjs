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
console.log("Bootstrap, login, cookie, dashboard e bloqueio anônimo validados.");
