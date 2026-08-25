import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const organizationStatus = pgEnum("organization_status", [
  "trial",
  "active",
  "past_due",
  "suspended",
  "cancelled",
]);
export const memberRole = pgEnum("member_role", [
  "owner",
  "manager",
  "editor",
  "analyst",
]);
export const platformRole = pgEnum("platform_role", ["user", "platform_admin"]);
export const mediaVisibility = pgEnum("media_visibility", [
  "public",
  "private",
]);
export const analyticsEventType = pgEnum("analytics_event_type", [
  "page_view",
  "action_click",
]);
export const analyticsSource = pgEnum("analytics_source", [
  "nfc",
  "qr",
  "direct",
  "unknown",
]);
export const insightRunStatus = pgEnum("insight_run_status", [
  "deterministic",
  "generated",
  "fallback",
  "failed",
  "approved",
  "rejected",
]);
export const subscriptionStatus = pgEnum("subscription_status", [
  "trial",
  "pending",
  "active",
  "past_due",
  "suspended",
  "cancelled",
]);
export const paymentStatus = pgEnum("payment_status", [
  "pending",
  "confirmed",
  "received",
  "overdue",
  "refunded",
  "cancelled",
]);

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  status: organizationStatus("status").notNull().default("trial"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const billingPlans = pgTable("billing_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  priceCents: integer("price_cents").notNull(),
  limitsJson: text("limits_json").notNull().default("{}"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  platformRole: platformRole("platform_role").notNull().default("user"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: memberRole("role").notNull().default("owner"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("memberships_org_user_unique").on(t.organizationId, t.userId),
    index("memberships_user_idx").on(t.userId),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    activeOrganizationId: uuid("active_organization_id").references(
      () => organizations.id,
      { onDelete: "set null" },
    ),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("sessions_user_idx").on(t.userId),
    index("sessions_expiry_idx").on(t.expiresAt),
  ],
);

export const publicPages = pgTable("public_pages", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .unique()
    .references(() => organizations.id, { onDelete: "cascade" }),
  slug: text("slug").notNull().unique(),
  settingsJson: text("settings_json").notNull().default("{}"),
  secretsJson: text("secrets_json").notNull().default("{}"),
  publishedSettingsJson: text("published_settings_json")
    .notNull()
    .default("{}"),
  publishedSecretsJson: text("published_secrets_json").notNull().default("{}"),
  published: boolean("published").notNull().default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const mediaAssets = pgTable(
  "media_assets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    objectKey: text("object_key").notNull().unique(),
    kind: text("kind").notNull(),
    visibility: mediaVisibility("visibility").notNull().default("private"),
    contentType: text("content_type").notNull(),
    sizeBytes: text("size_bytes").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("media_assets_org_idx").on(t.organizationId, t.createdAt)],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "set null",
    }),
    actorUserId: uuid("actor_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    metadataJson: text("metadata_json").notNull().default("{}"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("audit_org_created_idx").on(t.organizationId, t.createdAt)],
);

export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    publicPageId: uuid("public_page_id")
      .notNull()
      .references(() => publicPages.id, { onDelete: "cascade" }),
    eventType: analyticsEventType("event_type").notNull(),
    action: text("action"),
    source: analyticsSource("source").notNull().default("unknown"),
    visitorHash: text("visitor_hash").notNull(),
    dedupeKey: text("dedupe_key").notNull().unique(),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("analytics_events_org_time_idx").on(t.organizationId, t.occurredAt),
    index("analytics_events_page_type_idx").on(t.publicPageId, t.eventType),
  ],
);

export const organizationAiSettings = pgTable("organization_ai_settings", {
  organizationId: uuid("organization_id")
    .primaryKey()
    .references(() => organizations.id, { onDelete: "cascade" }),
  enabled: boolean("enabled").notNull().default(false),
  monthlyRequestLimit: integer("monthly_request_limit").notNull().default(20),
  monthlyTokenLimit: integer("monthly_token_limit").notNull().default(50000),
  requiresApproval: boolean("requires_approval").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insightRuns = pgTable(
  "insight_runs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    status: insightRunStatus("status").notNull().default("deterministic"),
    provider: text("provider").notNull().default("rules"),
    model: text("model"),
    promptVersion: text("prompt_version").notNull().default("insights-v1"),
    periodDays: integer("period_days").notNull().default(7),
    inputTokens: integer("input_tokens").notNull().default(0),
    outputTokens: integer("output_tokens").notNull().default(0),
    snapshotJson: text("snapshot_json").notNull(),
    outputJson: text("output_json").notNull(),
    errorCode: text("error_code"),
    reviewedBy: uuid("reviewed_by").references(() => users.id, {
      onDelete: "set null",
    }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("insight_runs_org_created_idx").on(t.organizationId, t.createdAt)],
);

export const organizationSubscriptions = pgTable(
  "organization_subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id").notNull().unique().references(() => organizations.id, { onDelete: "cascade" }),
    planId: uuid("plan_id").notNull().references(() => billingPlans.id),
    status: subscriptionStatus("status").notNull().default("trial"),
    billingType: text("billing_type").notNull().default("PIX"),
    provider: text("provider").notNull().default("asaas"),
    providerCustomerId: text("provider_customer_id"),
    providerSubscriptionId: text("provider_subscription_id").unique(),
    trialEndsAt: timestamp("trial_ends_at", { withTimezone: true }),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    pastDueAt: timestamp("past_due_at", { withTimezone: true }),
    suspendedAt: timestamp("suspended_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("organization_subscriptions_status_idx").on(t.status, t.updatedAt)],
);

export const billingPayments = pgTable(
  "billing_payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    subscriptionId: uuid("subscription_id").notNull().references(() => organizationSubscriptions.id, { onDelete: "cascade" }),
    providerPaymentId: text("provider_payment_id").notNull().unique(),
    status: paymentStatus("status").notNull().default("pending"),
    valueCents: integer("value_cents").notNull(),
    dueDate: timestamp("due_date", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    invoiceUrl: text("invoice_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("billing_payments_org_created_idx").on(t.organizationId, t.createdAt)],
);

export const billingWebhookEvents = pgTable("billing_webhook_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  providerEventId: text("provider_event_id").notNull().unique(),
  eventType: text("event_type").notNull(),
  payloadHash: text("payload_hash").notNull(),
  processed: boolean("processed").notNull().default(false),
  errorCode: text("error_code"),
  receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
});

export const securityRateLimits = pgTable("security_rate_limits", {
  id: uuid("id").primaryKey().defaultRandom(),
  keyHash: text("key_hash").notNull().unique(),
  scope: text("scope").notNull(),
  attempts: integer("attempts").notNull().default(1),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("security_rate_limits_expiry_idx").on(t.expiresAt)]);

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("password_reset_tokens_user_idx").on(t.userId, t.createdAt), index("password_reset_tokens_expiry_idx").on(t.expiresAt)]);
