import {drizzle} from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalDb=globalThis as unknown as {taplinkSql?:ReturnType<typeof postgres>};

function createClient(){
 const url=process.env.DATABASE_URL;
 if(!url)throw new Error("DATABASE_URL não configurada.");
 return postgres(url,{max:process.env.NODE_ENV==="production"?10:3,prepare:false});
}

export const sql=globalDb.taplinkSql??createClient();
if(process.env.NODE_ENV!=="production")globalDb.taplinkSql=sql;
export const db=drizzle(sql,{schema});
