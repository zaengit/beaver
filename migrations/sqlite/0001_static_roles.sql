PRAGMA foreign_keys = OFF;

CREATE TABLE `users_new` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `email` text NOT NULL,
  `password` text NOT NULL,
  `role` text NOT NULL DEFAULT 'author',
  `email_verified` integer NOT NULL DEFAULT 0,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);

INSERT INTO `users_new` (
  `id`, `name`, `email`, `password`, `role`, `email_verified`, `created_at`, `updated_at`
)
SELECT
  `users`.`id`,
  `users`.`name`,
  `users`.`email`,
  `users`.`password`,
  CASE `roles`.`slug`
    WHEN 'super-admin' THEN 'super-admin'
    WHEN 'admin' THEN 'admin'
    WHEN 'editor' THEN 'editor'
    WHEN 'author' THEN 'author'
    ELSE 'author'
  END,
  `users`.`email_verified`,
  `users`.`created_at`,
  `users`.`updated_at`
FROM `users`
LEFT JOIN `roles` ON `roles`.`id` = `users`.`role_id`;

DROP TABLE `role_permissions`;
DROP TABLE `users`;
DROP TABLE `permissions`;
DROP TABLE `roles`;

ALTER TABLE `users_new` RENAME TO `users`;
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);

PRAGMA foreign_keys = ON;
