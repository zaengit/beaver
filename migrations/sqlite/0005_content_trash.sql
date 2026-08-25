ALTER TABLE `posts` ADD COLUMN `deleted_at` integer;
--> statement-breakpoint
CREATE INDEX `posts_deleted_at_idx` ON `posts` (`deleted_at`, `type`, `updated_at`);
