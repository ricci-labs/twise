CREATE TYPE "public"."charge_email_status" AS ENUM('queued', 'sent', 'failed');--> statement-breakpoint
CREATE TYPE "public"."charge_sent_via" AS ENUM('whatsapp', 'email', 'manual');--> statement-breakpoint
CREATE TYPE "public"."contact_opt_out_via" AS ENUM('member', 'email_link');--> statement-breakpoint
CREATE TABLE "contact_opt_out_tokens" (
	"workspace_id" uuid NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"contact_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contact_opt_out_tokens" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "charges" ADD COLUMN "sent_via" charge_sent_via;--> statement-breakpoint
ALTER TABLE "charges" ADD COLUMN "sent_to" text;--> statement-breakpoint
ALTER TABLE "charges" ADD COLUMN "email_status" charge_email_status;--> statement-breakpoint
ALTER TABLE "charges" ADD COLUMN "email_error" text;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "opted_out_via" "contact_opt_out_via";--> statement-breakpoint
ALTER TABLE "contact_opt_out_tokens" ADD CONSTRAINT "contact_opt_out_tokens_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_opt_out_tokens" ADD CONSTRAINT "contact_opt_out_tokens_contact_fk" FOREIGN KEY ("workspace_id","contact_id") REFERENCES "public"."contacts"("workspace_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "contact_opt_out_tokens_token_hash_unique" ON "contact_opt_out_tokens" USING btree ("token_hash");--> statement-breakpoint
ALTER TABLE "charges" ADD CONSTRAINT "charges_email_status" CHECK (("charges"."sent_via" is not distinct from 'email') = ("charges"."email_status" is not null));--> statement-breakpoint
ALTER TABLE "charges" ADD CONSTRAINT "charges_email_error" CHECK ("charges"."email_error" is null or ("charges"."email_status" is not distinct from 'failed' and length("charges"."email_error") <= 200));--> statement-breakpoint
UPDATE "contacts" SET "opted_out_via" = 'member' WHERE "opted_out_at" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_opted_out_via" CHECK (("contacts"."opted_out_at" is null) = ("contacts"."opted_out_via" is null));--> statement-breakpoint
CREATE POLICY "contact_opt_out_tokens_tenant_isolation" ON "contact_opt_out_tokens" AS PERMISSIVE FOR ALL TO "financas_app" USING ("contact_opt_out_tokens"."workspace_id" = app_current_workspace_id()) WITH CHECK ("contact_opt_out_tokens"."workspace_id" = app_current_workspace_id());--> statement-breakpoint
CREATE FUNCTION contact_opt_out_workspace_id(lookup_token_hash text) RETURNS uuid
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public, pg_temp
  AS $$ SELECT workspace_id FROM contact_opt_out_tokens WHERE token_hash = lookup_token_hash $$;
--> statement-breakpoint
REVOKE ALL ON FUNCTION contact_opt_out_workspace_id(text) FROM PUBLIC;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION contact_opt_out_workspace_id(text) TO financas_app;
