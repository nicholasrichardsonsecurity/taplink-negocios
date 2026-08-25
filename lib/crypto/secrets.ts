import {createCipheriv,createDecipheriv,createHash,randomBytes} from "node:crypto";

function key(){
 const value=process.env.ENCRYPTION_KEY;
 if(!value||value.length<32)throw new Error("ENCRYPTION_KEY deve possuir ao menos 32 caracteres.");
 return createHash("sha256").update(value).digest();
}

export function encryptSecret(value:string){
 if(!value)return "";
 const iv=randomBytes(12);const cipher=createCipheriv("aes-256-gcm",key(),iv);
 const encrypted=Buffer.concat([cipher.update(value,"utf8"),cipher.final()]);
 return ["v1",iv.toString("base64url"),cipher.getAuthTag().toString("base64url"),encrypted.toString("base64url")].join(".");
}

export function decryptSecret(payload:string){
 if(!payload)return "";
 const [version,ivValue,tagValue,dataValue]=payload.split(".");
 if(version!=="v1"||!ivValue||!tagValue||!dataValue)throw new Error("Segredo criptografado inválido.");
 const decipher=createDecipheriv("aes-256-gcm",key(),Buffer.from(ivValue,"base64url"));
 decipher.setAuthTag(Buffer.from(tagValue,"base64url"));
 return Buffer.concat([decipher.update(Buffer.from(dataValue,"base64url")),decipher.final()]).toString("utf8");
}
