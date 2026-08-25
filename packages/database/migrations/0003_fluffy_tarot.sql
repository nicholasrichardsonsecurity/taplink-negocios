CREATE TYPE "public"."analytics_event_type" AS ENUM('page_view', 'action_click');--> statement-breakpoint
CREATE TYPE "public"."analytics_source" AS ENUM('nfc', 'qr', 'direct', 'unknown');--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"public_page_id" uuid NOT NULL,
	"event_type" "analytics_event_type" NOT NULL,
	"action" text,
	"source" "analytics_source" DEFAULT 'unknown' NOT NULL,
	"visitor_hash" text NOT NULL,
	"dedupe_key" text NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "analytics_events_dedupe_key_unique" UNIQUE("dedupe_key")
);
--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_public_page_id_public_pages_id_fk" FOREIGN KEY ("public_page_id") REFERENCES "public"."public_pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "analytics_events_org_time_idx" ON "analytics_events" USING btree ("organization_id","occurred_at");--> statement-breakpoint
CREATE INDEX "analytics_events_page_type_idx" ON "analytics_events" USING btree ("public_page_id","event_type");