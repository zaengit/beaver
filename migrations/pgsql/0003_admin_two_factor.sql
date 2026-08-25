CREATE TABLE "admin_two_factor" (
  "user_id" varchar(26) PRIMARY KEY NOT NULL,
  "secret" text NOT NULL,
  "enabled" integer NOT NULL DEFAULT 0,
  "created_at" bigint NOT NULL,
  "updated_at" bigint NOT NULL
);
