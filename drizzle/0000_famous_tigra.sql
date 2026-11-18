CREATE TABLE "account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "department" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(64) NOT NULL,
	"name" varchar(128) NOT NULL,
	"short_name" varchar(32) NOT NULL,
	"hod_staff_id" uuid,
	"description_json" jsonb,
	"banner_url" text,
	"banner_public_id" varchar(255),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "department_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(128) NOT NULL,
	"title" varchar(255) NOT NULL,
	"tagline" varchar(255),
	"description_json" jsonb NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"venue_name" varchar(255) NOT NULL,
	"venue_address" text,
	"google_maps_url" text,
	"flyer_url" text,
	"flyer_public_id" varchar(255),
	"agenda" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "event_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "faculty_staff" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(128) NOT NULL,
	"full_name" varchar(128) NOT NULL,
	"designation" varchar(128) NOT NULL,
	"email" varchar(255),
	"photo_url" text,
	"photo_public_id" varchar(255),
	"bio_json" jsonb,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "faculty_staff_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "goodwill_message" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid,
	"staff_id" uuid,
	"guest_author" jsonb,
	"message_json" jsonb NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(128) NOT NULL,
	"title" varchar(255) NOT NULL,
	"org_name" varchar(128) NOT NULL,
	"org_url" text,
	"org_logo_url" text,
	"scope_type" text DEFAULT 'faculty' NOT NULL,
	"department_id" uuid,
	"session_id" uuid,
	"type" text NOT NULL,
	"location" varchar(128) NOT NULL,
	"description_json" jsonb NOT NULL,
	"apply_url" text NOT NULL,
	"deadline" timestamp with time zone,
	"status" text DEFAULT 'draft' NOT NULL,
	"submitted_by_user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "opportunity_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "person" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(128) NOT NULL,
	"full_name" varchar(128) NOT NULL,
	"photo_url" text,
	"photo_public_id" varchar(255),
	"socials" jsonb,
	"current_role" varchar(128),
	"current_company" varchar(128),
	"bio_json" jsonb,
	"claimed_by_user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "person_slug_unique" UNIQUE("slug"),
	CONSTRAINT "person_claimed_by_user_id_unique" UNIQUE("claimed_by_user_id")
);
--> statement-breakpoint
CREATE TABLE "platform_setting" (
	"key" varchar(64) PRIMARY KEY NOT NULL,
	"value_json" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(128) NOT NULL,
	"title" varchar(255) NOT NULL,
	"excerpt" text NOT NULL,
	"body_json" jsonb NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"featured" boolean DEFAULT false NOT NULL,
	"author_user_id" uuid NOT NULL,
	"cover_url" text,
	"cover_public_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "post_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "project" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(128) NOT NULL,
	"title" varchar(255) NOT NULL,
	"tagline" varchar(255) NOT NULL,
	"description_json" jsonb NOT NULL,
	"department_id" uuid NOT NULL,
	"session_id" uuid,
	"category" text NOT NULL,
	"course_code" varchar(32),
	"cohort_group_number" integer,
	"team_display_name" varchar(128),
	"lead_contributors" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"rejection_reason" text,
	"author_user_id" uuid NOT NULL,
	"banner_url" text,
	"banner_public_id" varchar(255),
	"gallery_urls" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"repo_url" text,
	"demo_url" text,
	"featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "project_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "school_session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(32) NOT NULL,
	"name" varchar(64) NOT NULL,
	"theme" text,
	"reg_number_prefixes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_current" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "school_session_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "session_role" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"department_id" uuid,
	"tier" text NOT NULL,
	"role_title" varchar(128) NOT NULL,
	"honours" varchar(255),
	"quote" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_featured_homepage" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "session_role_identity_unique" UNIQUE("person_id","session_id","tier","role_title")
);
--> statement-breakpoint
CREATE TABLE "slug_redirect" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" text NOT NULL,
	"old_slug" varchar(128) NOT NULL,
	"target_slug" varchar(128) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "slug_redirect_old_slug_unique" UNIQUE("old_slug")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(128) NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" text DEFAULT 'user' NOT NULL,
	"department_id" uuid,
	"reg_number" varchar(32),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "department" ADD CONSTRAINT "department_hod_staff_id_faculty_staff_id_fk" FOREIGN KEY ("hod_staff_id") REFERENCES "public"."faculty_staff"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goodwill_message" ADD CONSTRAINT "goodwill_message_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goodwill_message" ADD CONSTRAINT "goodwill_message_staff_id_faculty_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."faculty_staff"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity" ADD CONSTRAINT "opportunity_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity" ADD CONSTRAINT "opportunity_session_id_school_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."school_session"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity" ADD CONSTRAINT "opportunity_submitted_by_user_id_user_id_fk" FOREIGN KEY ("submitted_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person" ADD CONSTRAINT "person_claimed_by_user_id_user_id_fk" FOREIGN KEY ("claimed_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_author_user_id_user_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_session_id_school_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."school_session"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_author_user_id_user_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_role" ADD CONSTRAINT "session_role_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_role" ADD CONSTRAINT "session_role_session_id_school_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."school_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_role" ADD CONSTRAINT "session_role_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "event_start_date_idx" ON "event" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "goodwill_message_person_id_idx" ON "goodwill_message" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "opportunity_department_id_idx" ON "opportunity" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "opportunity_type_idx" ON "opportunity" USING btree ("type");--> statement-breakpoint
CREATE INDEX "opportunity_status_idx" ON "opportunity" USING btree ("status");--> statement-breakpoint
CREATE INDEX "person_claimed_by_user_id_idx" ON "person" USING btree ("claimed_by_user_id");--> statement-breakpoint
CREATE INDEX "post_author_user_id_idx" ON "post" USING btree ("author_user_id");--> statement-breakpoint
CREATE INDEX "post_status_idx" ON "post" USING btree ("status");--> statement-breakpoint
CREATE INDEX "project_department_id_idx" ON "project" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "project_session_id_idx" ON "project" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "project_author_user_id_idx" ON "project" USING btree ("author_user_id");--> statement-breakpoint
CREATE INDEX "project_status_idx" ON "project" USING btree ("status");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_role_person_id_idx" ON "session_role" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "session_role_session_id_idx" ON "session_role" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "session_role_department_id_idx" ON "session_role" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "user_department_id_idx" ON "user" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");