CREATE TABLE "activity_logs" (
  "id" varchar(26) PRIMARY KEY NOT NULL,
  "actor_id" varchar(26),
  "actor_name" varchar(255),
  "actor_email" varchar(255),
  "action" varchar(64) NOT NULL,
  "resource" varchar(64) NOT NULL,
  "resource_id" varchar(26),
  "metadata" text,
  "ip_address" varchar(45),
  "user_agent" text,
  "success" integer NOT NULL DEFAULT 1,
  "status_code" integer NOT NULL DEFAULT 200,
  "created_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE INDEX "activity_logs_created_at_idx" ON "activity_logs" ("created_at");
--> statement-breakpoint
CREATE INDEX "activity_logs_actor_created_at_idx" ON "activity_logs" ("actor_id", "created_at");
--> statement-breakpoint
CREATE INDEX "activity_logs_resource_created_at_idx" ON "activity_logs" ("resource", "resource_id", "created_at");
