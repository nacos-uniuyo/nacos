DROP INDEX "person_claimed_by_user_id_idx";--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "author_user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "faculty_staff" ADD COLUMN "department_id" uuid;--> statement-breakpoint
ALTER TABLE "opportunity" ADD COLUMN "rejection_reason" text;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_author_user_id_user_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty_staff" ADD CONSTRAINT "faculty_staff_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE set null ON UPDATE no action;