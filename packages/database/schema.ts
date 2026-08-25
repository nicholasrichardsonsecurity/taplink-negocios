import {boolean,index,pgEnum,pgTable,text,timestamp,uniqueIndex,uuid} from "drizzle-orm/pg-core";

export const organizationStatus=pgEnum("organization_status",["trial","active","past_due","suspended","cancelled"]);
export const memberRole=pgEnum("member_role",["owner","manager","editor","analyst"]);

export const organizations=pgTable("organizations",{
 id:uuid("id").primaryKey().defaultRandom(),
 slug:text("slug").notNull().unique(),
 name:text("name").notNull(),
 status:organizationStatus("status").notNull().default("trial"),
 createdAt:timestamp("created_at",{withTimezone:true}).notNull().defaultNow(),
 updatedAt:timestamp("updated_at",{withTimezone:true}).notNull().defaultNow()
});

export const users=pgTable("users",{
 id:uuid("id").primaryKey().defaultRandom(),
 name:text("name").notNull(),
 email:text("email").notNull().unique(),
 passwordHash:text("password_hash").notNull(),
 active:boolean("active").notNull().default(true),
 createdAt:timestamp("created_at",{withTimezone:true}).notNull().defaultNow(),
 updatedAt:timestamp("updated_at",{withTimezone:true}).notNull().defaultNow()
});

export const memberships=pgTable("memberships",{
 id:uuid("id").primaryKey().defaultRandom(),
 organizationId:uuid("organization_id").notNull().references(()=>organizations.id,{onDelete:"cascade"}),
 userId:uuid("user_id").notNull().references(()=>users.id,{onDelete:"cascade"}),
 role:memberRole("role").notNull().default("owner"),
 createdAt:timestamp("created_at",{withTimezone:true}).notNull().defaultNow()
},t=>[uniqueIndex("memberships_org_user_unique").on(t.organizationId,t.userId),index("memberships_user_idx").on(t.userId)]);

export const sessions=pgTable("sessions",{
 id:uuid("id").primaryKey().defaultRandom(),
 userId:uuid("user_id").notNull().references(()=>users.id,{onDelete:"cascade"}),
 tokenHash:text("token_hash").notNull().unique(),
 expiresAt:timestamp("expires_at",{withTimezone:true}).notNull(),
 createdAt:timestamp("created_at",{withTimezone:true}).notNull().defaultNow(),
 lastSeenAt:timestamp("last_seen_at",{withTimezone:true}).notNull().defaultNow()
},t=>[index("sessions_user_idx").on(t.userId),index("sessions_expiry_idx").on(t.expiresAt)]);

export const publicPages=pgTable("public_pages",{
 id:uuid("id").primaryKey().defaultRandom(),
 organizationId:uuid("organization_id").notNull().unique().references(()=>organizations.id,{onDelete:"cascade"}),
 slug:text("slug").notNull().unique(),
 settingsJson:text("settings_json").notNull().default("{}"),
 secretsJson:text("secrets_json").notNull().default("{}"),
 publishedSettingsJson:text("published_settings_json").notNull().default("{}"),
 publishedSecretsJson:text("published_secrets_json").notNull().default("{}"),
 published:boolean("published").notNull().default(false),
 publishedAt:timestamp("published_at",{withTimezone:true}),
 createdAt:timestamp("created_at",{withTimezone:true}).notNull().defaultNow(),
 updatedAt:timestamp("updated_at",{withTimezone:true}).notNull().defaultNow()
});

export const auditLogs=pgTable("audit_logs",{
 id:uuid("id").primaryKey().defaultRandom(),
 organizationId:uuid("organization_id").references(()=>organizations.id,{onDelete:"set null"}),
 actorUserId:uuid("actor_user_id").references(()=>users.id,{onDelete:"set null"}),
 action:text("action").notNull(),
 entityType:text("entity_type").notNull(),
 entityId:text("entity_id"),
 metadataJson:text("metadata_json").notNull().default("{}"),
 createdAt:timestamp("created_at",{withTimezone:true}).notNull().defaultNow()
},t=>[index("audit_org_created_idx").on(t.organizationId,t.createdAt)]);
