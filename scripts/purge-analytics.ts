import {lt} from "drizzle-orm";
import {db,sql} from "../packages/database/client";
import {analyticsEvents} from "../packages/database/schema";

const configured=Number(process.env.ANALYTICS_RETENTION_DAYS??395);if(!Number.isInteger(configured)||configured<30||configured>730)throw new Error("ANALYTICS_RETENTION_DAYS deve estar entre 30 e 730.");
const cutoff=new Date(Date.now()-configured*86400000);const removed=await db.delete(analyticsEvents).where(lt(analyticsEvents.occurredAt,cutoff)).returning({id:analyticsEvents.id});console.log(JSON.stringify({ok:true,retentionDays:configured,cutoff:cutoff.toISOString(),removed:removed.length}));await sql.end();
