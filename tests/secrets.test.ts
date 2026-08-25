import test from "node:test";
import assert from "node:assert/strict";
import {decryptSecret,encryptSecret} from "../lib/crypto/secrets";

process.env.ENCRYPTION_KEY="test-encryption-key-with-at-least-32-characters";
test("criptografa com nonce único e recupera o segredo",()=>{const a=encryptSecret("wifi-super-seguro");const b=encryptSecret("wifi-super-seguro");assert.notEqual(a,b);assert.equal(decryptSecret(a),"wifi-super-seguro");assert.equal(decryptSecret(b),"wifi-super-seguro");assert.doesNotMatch(a,/wifi-super-seguro/)});
test("rejeita conteúdo adulterado",()=>{const encrypted=encryptSecret("segredo");assert.throws(()=>decryptSecret(`${encrypted}x`))});
