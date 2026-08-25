CREATE TABLE `admin_two_factor` (
  `user_id` varchar(26) NOT NULL,
  `secret` text NOT NULL,
  `enabled` int NOT NULL DEFAULT 0,
  `created_at` bigint NOT NULL,
  `updated_at` bigint NOT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
