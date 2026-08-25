import test from "node:test";
import assert from "node:assert/strict";
import {buildWifiUri,escapeWifiValue} from "@/lib/wifi";

test("escapa caracteres reservados do padrão Wi-Fi",()=>{assert.equal(escapeWifiValue('Rede;Casa:5G\\"'),'Rede\\;Casa\\:5G\\\\\\"')});
test("gera URI de conexão Wi-Fi WPA",()=>{assert.equal(buildWifiUri("Lisarojo","segredo"),"WIFI:T:WPA;S:Lisarojo;P:segredo;;")});
