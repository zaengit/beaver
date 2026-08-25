ALTER TABLE "posts" DROP CONSTRAINT "posts_author_id_fk";
--> statement-breakpoint

ALTER TABLE "media" DROP CONSTRAINT "media_user_id_fk";
--> statement-breakpoint

UPDATE "posts" AS "p"
SET "author_id" = 'env-super-admin'
FROM "users" AS "u"
WHERE "u"."id" = "p"."author_id" AND "u"."role" = 'super-admin';
--> statement-breakpoint

UPDATE "media" AS "m"
SET "user_id" = 'env-super-admin'
FROM "users" AS "u"
WHERE "u"."id" = "m"."user_id" AND "u"."role" = 'super-admin';
--> statement-breakpoint

DELETE FROM "admin_refresh_sessions" AS "s"
USING "users" AS "u"
WHERE "u"."id" = "s"."user_id" AND "u"."role" = 'super-admin';
--> statement-breakpoint

DELETE FROM "password_reset_tokens" AS "t"
USING "users" AS "u"
WHERE "u"."id" = "t"."user_id" AND "u"."role" = 'super-admin';
--> statement-breakpoint

DELETE FROM "users" WHERE "role" = 'super-admin';
