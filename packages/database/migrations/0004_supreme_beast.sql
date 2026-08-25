CREATE TYPE "public"."insight_run_status" AS ENUM('deterministic', 'generated', 'fallback', 'failed', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "insight_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"created_by" uuid,
	"status" "insight_run_status" DEFAULT 'deterministic' NOT NULL,
	"provider" text DEFAULT 'rules' NOT NULL,
	"model" text,
	"prompt_version" text DEFAULT 'insights-v1' NOT NULL,
	"period_days" integer DEFAULT 7 NOT NULL,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"snapshot_json" text NOT NULL,
	"output_json" text NOT NULL,
	"error_code" text,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_ai_settings" (
	"organization_id" uuid PRIMARY KEY NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"monthly_request_limit" integer DEFAULT 20 NOT NULL,
	"monthly_token_limit" integer DEFAULT 50000 NOT NULL,
	"requires_approval" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "insight_runs" ADD CONSTRAINT "insight_runs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insight_runs" ADD CONSTRAINT "insight_runs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insight_runs" ADD CONSTRAINT "insight_runs_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_ai_settings" ADD CONSTRAINT "organization_ai_settings_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "insight_runs_org_created_idx" ON "insight_runs" USING btree ("organization_id","created_at");