import test from "node:test";
import assert from "node:assert/strict";
import {hashPassword,verifyPassword} from "../lib/auth/password";

test("gera hashes diferentes para a mesma senha",async()=>{
 const first=await hashPassword("uma-senha-forte-123");
 const second=await hashPassword("uma-senha-forte-123");
 assert.notEqual(first,second);
 assert.match(first,/^scrypt\$/);
});

test("aceita a senha correta e rejeita a incorreta",async()=>{
 const hash=await hashPassword("uma-senha-forte-123");
 assert.equal(await verifyPassword("uma-senha-forte-123",hash),true);
 assert.equal(await verifyPassword("senha-errada-123",hash),false);
 assert.equal(await verifyPassword("qualquer-coisa","formato-invalido"),false);
});
