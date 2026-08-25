import {and,eq} from "drizzle-orm";
import {db} from "./client";
import {memberships,organizations,users} from "./schema";

export async function getTenantMembership(userId:string,organizationId:string){
 const rows=await db.select({
  userId:users.id,
  organizationId:organizations.id,
  organizationSlug:organizations.slug,
  organizationStatus:organizations.status,
  role:memberships.role
 }).from(memberships)
  .innerJoin(users,eq(users.id,memberships.userId))
  .innerJoin(organizations,eq(organizations.id,memberships.organizationId))
  .where(and(eq(memberships.userId,userId),eq(memberships.organizationId,organizationId),eq(users.active,true)))
  .limit(1);
 return rows[0]??null;
}

export async function requireTenantMembership(userId:string,organizationId:string){
 const membership=await getTenantMembership(userId,organizationId);
 if(!membership)throw new Error("TENANT_ACCESS_DENIED");
 return membership;
}
