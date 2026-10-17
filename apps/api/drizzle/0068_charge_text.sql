ALTER TABLE "workspace_settings" ADD COLUMN "charge_subject" text;--> statement-breakpoint
ALTER TABLE "workspace_settings" ADD COLUMN "charge_opening" text;--> statement-breakpoint
ALTER TABLE "workspace_settings" ADD COLUMN "charge_closing" text;--> statement-breakpoint
ALTER TABLE "workspace_settings" ADD CONSTRAINT "workspace_settings_charge_text_complete" CHECK (("workspace_settings"."charge_subject" is null) = ("workspace_settings"."charge_opening" is null)
        and ("workspace_settings"."charge_closing" is null or "workspace_settings"."charge_subject" is not null));--> statement-breakpoint
ALTER TABLE "workspace_settings" ADD CONSTRAINT "workspace_settings_charge_text_lengths" CHECK (coalesce(length("workspace_settings"."charge_subject"), 1) between 1 and 120
        and coalesce(length("workspace_settings"."charge_opening"), 1) between 1 and 300
        and coalesce(length("workspace_settings"."charge_closing"), 0) <= 300);