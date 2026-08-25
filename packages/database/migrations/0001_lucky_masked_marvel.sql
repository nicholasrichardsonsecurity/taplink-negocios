ALTER TABLE "public_pages" ADD COLUMN "secrets_json" text DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "public_pages" ADD COLUMN "published_settings_json" text DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "public_pages" ADD COLUMN "published_secrets_json" text DEFAULT '{}' NOT NULL;