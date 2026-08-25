import test from "node:test";
import assert from "node:assert/strict";
import {lisarojoDefaults,pageSettingsSchema} from "../lib/page-settings";

test("aceita a configuração padrão da Lisarojo",()=>assert.equal(pageSettingsSchema.safeParse(lisarojoDefaults).success,true));
test("rejeita atalhos duplicados",()=>assert.equal(pageSettingsSchema.safeParse({...lisarojoDefaults,shortcuts:["Avaliar","Avaliar","Wi-Fi"]}).success,false));
test("rejeita URL e cor inseguras",()=>{assert.equal(pageSettingsSchema.safeParse({...lisarojoDefaults,menuUrl:"javascript:alert(1)"}).success,false);assert.equal(pageSettingsSchema.safeParse({...lisarojoDefaults,primaryColor:"red"}).success,false)});
