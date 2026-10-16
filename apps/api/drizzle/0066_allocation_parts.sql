CREATE TABLE "allocation_parts" (
	"workspace_id" uuid NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"period_label" text NOT NULL,
	"position" smallint NOT NULL,
	"to_account_id" uuid NOT NULL,
	"entry_id" uuid NOT NULL,
	"recorded_by_user_id" uuid NOT NULL,
	"deleted_at" timestamp with time zone,
	"deleted_by_user_id" uuid,
	"delete_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "allocation_parts_workspace_id_id_unique" UNIQUE("workspace_id","id"),
	CONSTRAINT "allocation_parts_position" CHECK ("allocation_parts"."position" between 1 and 10),
	CONSTRAINT "allocation_parts_period_label" CHECK ("allocation_parts"."period_label" ~ '^[0-9]{4}-(0[1-9]|1[0-2])$')
);
--> statement-breakpoint
ALTER TABLE "allocation_parts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "allocation_parts" ADD CONSTRAINT "allocation_parts_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "allocation_parts" ADD CONSTRAINT "allocation_parts_recorded_by_user_id_users_id_fk" FOREIGN KEY ("recorded_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "allocation_parts" ADD CONSTRAINT "allocation_parts_deleted_by_user_id_users_id_fk" FOREIGN KEY ("deleted_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "allocation_parts" ADD CONSTRAINT "allocation_parts_account_fk" FOREIGN KEY ("workspace_id","to_account_id") REFERENCES "public"."ledger_accounts"("workspace_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "allocation_parts" ADD CONSTRAINT "allocation_parts_entry_fk" FOREIGN KEY ("workspace_id","entry_id") REFERENCES "public"."journal_entries"("workspace_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "allocation_parts_one_per_position" ON "allocation_parts" USING btree ("workspace_id","period_label","position") WHERE "allocation_parts"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "allocation_parts_one_per_entry" ON "allocation_parts" USING btree ("workspace_id","entry_id") WHERE "allocation_parts"."deleted_at" is null;--> statement-breakpoint
CREATE POLICY "allocation_parts_tenant_isolation" ON "allocation_parts" AS PERMISSIVE FOR ALL TO "financas_app" USING ("allocation_parts"."workspace_id" = app_current_workspace_id()) WITH CHECK ("allocation_parts"."workspace_id" = app_current_workspace_id());--> statement-breakpoint
CREATE TRIGGER allocation_parts_set_updated_at
  BEFORE UPDATE ON allocation_parts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint
CREATE FUNCTION allocation_parts_follow_deleted_entry() RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_temp
  AS $$
DECLARE
  entry journal_entries;
  replacement_id uuid;
BEGIN
  SELECT * INTO entry FROM journal_entries WHERE id = NEW.id;
  IF NOT FOUND OR entry.deleted_at IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT id INTO replacement_id FROM journal_entries
  WHERE workspace_id = entry.workspace_id AND replaces_entry_id = entry.id AND deleted_at IS NULL;

  IF replacement_id IS NOT NULL THEN
    UPDATE allocation_parts SET entry_id = replacement_id
    WHERE workspace_id = entry.workspace_id AND entry_id = entry.id AND deleted_at IS NULL;
  ELSE
    UPDATE allocation_parts SET deleted_at = now()
    WHERE workspace_id = entry.workspace_id AND entry_id = entry.id AND deleted_at IS NULL;
  END IF;

  RETURN NULL;
END
$$;
--> statement-breakpoint
CREATE CONSTRAINT TRIGGER allocation_parts_follow_deleted_entry
  AFTER UPDATE OF deleted_at ON journal_entries
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW
  WHEN (OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL)
  EXECUTE FUNCTION allocation_parts_follow_deleted_entry();
--> statement-breakpoint
ALTER TABLE allocation_parts
  ALTER CONSTRAINT allocation_parts_account_fk DEFERRABLE INITIALLY DEFERRED;
--> statement-breakpoint
ALTER TABLE allocation_parts
  ALTER CONSTRAINT allocation_parts_entry_fk DEFERRABLE INITIALLY DEFERRED;
