CREATE TABLE `admin_two_factor` (
  `user_id` text PRIMARY KEY NOT NULL,
  `secret` text NOT NULL,
  `enabled` integer NOT NULL DEFAULT 0,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
