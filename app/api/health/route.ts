import {sql} from "@/packages/database/client";

export async function GET(){try{await sql`select 1`;return Response.json({status:"ok",service:"taplink-web",database:"connected",time:new Date().toISOString()})}catch{return Response.json({status:"error",service:"taplink-web",database:"unavailable"},{status:503})}}
