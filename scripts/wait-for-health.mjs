const url=process.env.APP_URL??"http://127.0.0.1:3000";
const deadline=Date.now()+60_000;
while(Date.now()<deadline){
 try{const response=await fetch(`${url}/api/health`);if(response.ok){console.log("Aplicação e banco saudáveis.");process.exit(0)}}catch{}
 await new Promise(resolve=>setTimeout(resolve,1000));
}
throw new Error("Aplicação não ficou saudável em 60 segundos.");
