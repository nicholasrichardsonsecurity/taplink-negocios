import {readFile} from "node:fs/promises";

const required=["LICENSE.md","NOTICE.md","README.md","docs/OWNERSHIP_AND_PROTECTION.md"];
for(const file of required){
 const content=await readFile(new URL(`../${file}`,import.meta.url),"utf8");
 if(!content.includes("Nicholas Richardson")||!content.includes("GigaNetPe Telecom")){
  throw new Error(`Aviso de titularidade ausente ou incompleto em ${file}`);
 }
}
console.log("Titularidade e avisos obrigatórios verificados.");
