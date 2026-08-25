import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const patterns = [
  { name: "chave privada", regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { name: "OpenAI API key", regex: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
  { name: "Resend API key", regex: /\bre_[A-Za-z0-9_-]{20,}\b/ },
  { name: "AWS access key", regex: /\bAKIA[A-Z0-9]{16}\b/ },
  { name: "token Asaas", regex: /\$aact_[A-Za-z0-9_-]{20,}/ },
];
const files = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean).filter(file => !file.endsWith("package-lock.json") && !/\.(png|jpg|jpeg|webp|ico)$/i.test(file));
const findings=[];
for(const file of files){let content;try{content=readFileSync(file,"utf8")}catch{continue}for(const pattern of patterns)if(pattern.regex.test(content))findings.push(`${file}: ${pattern.name}`)}
if(findings.length){console.error("Possíveis segredos encontrados:\n"+findings.join("\n"));process.exit(1)}
console.log(`Secret scan aprovado em ${files.length} arquivos rastreados.`);
