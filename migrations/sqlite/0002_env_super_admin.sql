PRAGMA foreign_keys = OFF;

UPDATE `posts`
SET `author_id` = 'env-super-admin'
WHERE `author_id` IN (SELECT `id` FROM `users` WHERE `role` = 'super-admin');

UPDATE `media`
SET `user_id` = 'env-super-admin'
WHERE `user_id` IN (SELECT `id` FROM `users` WHERE `role` = 'super-admin');

DELETE FROM `admin_refresh_sessions`
WHERE `user_id` IN (SELECT `id` FROM `users` WHERE `role` = 'super-admin');

DELETE FROM `password_reset_tokens`
WHERE `user_id` IN (SELECT `id` FROM `users` WHERE `role` = 'super-admin');

CREATE TABLE `posts_new` (
  `id` text PRIMARY KEY NOT NULL,
  `title` text NOT NULL,
  `slug` text NOT NULL,
  `type` text NOT NULL DEFAULT 'post',
  `status` text NOT NULL DEFAULT 'draft',
  `excerpt` text,
  `description` text,
  `tags` text,
  `sections` text,
  `custom_field_values` text,
  `meta_title` text,
  `meta_description` text,
  `featured_image` text,
  `gallery` text,
  `author_id` text NOT NULL,
  `published_at` integer,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);

INSERT INTO `posts_new`
SELECT `id`, `title`, `slug`, `type`, `status`, `excerpt`, `description`, `tags`,
  `sections`, `custom_field_values`, `meta_title`, `meta_description`,
  `featured_image`, `gallery`, `author_id`, `published_at`, `created_at`, `updated_at`
FROM `posts`;

DROP TABLE `posts`;
ALTER TABLE `posts_new` RENAME TO `posts`;
CREATE UNIQUE INDEX `posts_slug_unique` ON `posts` (`slug`);

CREATE TABLE `media_new` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `name` text NOT NULL,
  `file_name` text NOT NULL,
  `mime_type` text NOT NULL,
  `size` integer NOT NULL,
  `url` text NOT NULL,
  `thumbnail_url` text,
  `alt` text,
  `caption` text,
  `width` integer,
  `height` integer,
  `folder` text,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);

INSERT INTO `media_new`
SELECT `id`, `user_id`, `name`, `file_name`, `mime_type`, `size`, `url`,
  `thumbnail_url`, `alt`, `caption`, `width`, `height`, `folder`,
  `created_at`, `updated_at`
FROM `media`;

DROP TABLE `media`;
ALTER TABLE `media_new` RENAME TO `media`;

DELETE FROM `users` WHERE `role` = 'super-admin';

PRAGMA foreign_keys = ON;
