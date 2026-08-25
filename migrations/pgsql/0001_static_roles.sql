ALTER TABLE "users" ADD COLUMN "role" varchar(32);
--> statement-breakpoint

UPDATE "users" AS "u"
SET "role" = CASE "r"."slug"
  WHEN 'super-admin' THEN 'super-admin'
  WHEN 'admin' THEN 'admin'
  WHEN 'editor' THEN 'editor'
  WHEN 'author' THEN 'author'
  ELSE 'author'
END
FROM "roles" AS "r"
WHERE "r"."id" = "u"."role_id";
--> statement-breakpoint

UPDATE "users" SET "role" = 'author' WHERE "role" IS NULL;
--> statement-breakpoint

ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'author';
--> statement-breakpoint

ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL;
--> statement-breakpoint

ALTER TABLE "users" DROP CONSTRAINT "users_role_id_fk";
--> statement-breakpoint

ALTER TABLE "users" DROP COLUMN "role_id";
--> statement-breakpoint

DROP TABLE "role_permissions";
--> statement-breakpoint

DROP TABLE "permissions";
--> statement-breakpoint

DROP TABLE "roles";
