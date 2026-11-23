CREATE TABLE "opportunity_bookmark" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"opportunity_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "opportunity_bookmark_user_opportunity_unique" UNIQUE("user_id","opportunity_id")
);
--> statement-breakpoint
CREATE TABLE "department_notice" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"department_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(128) NOT NULL,
	"content_json" jsonb NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"author_user_id" uuid NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "department_notice_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "opportunity_bookmark" ADD CONSTRAINT "opportunity_bookmark_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_bookmark" ADD CONSTRAINT "opportunity_bookmark_opportunity_id_opportunity_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunity"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "department_notice" ADD CONSTRAINT "department_notice_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "department_notice" ADD CONSTRAINT "department_notice_author_user_id_user_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "opportunity_bookmark_user_id_idx" ON "opportunity_bookmark" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "opportunity_bookmark_opportunity_id_idx" ON "opportunity_bookmark" USING btree ("opportunity_id");--> statement-breakpoint
CREATE INDEX "department_notice_department_id_idx" ON "department_notice" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "department_notice_author_user_id_idx" ON "department_notice" USING btree ("author_user_id");--> statement-breakpoint
CREATE INDEX "department_notice_created_at_idx" ON "department_notice" USING btree ("created_at");
