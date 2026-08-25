CREATE TABLE `activity_logs` (
  `id` varchar(26) NOT NULL,
  `actor_id` varchar(26),
  `actor_name` varchar(255),
  `actor_email` varchar(255),
  `action` varchar(64) NOT NULL,
  `resource` varchar(64) NOT NULL,
  `resource_id` varchar(26),
  `metadata` text,
  `ip_address` varchar(45),
  `user_agent` text,
  `success` int NOT NULL DEFAULT 1,
  `status_code` int NOT NULL DEFAULT 200,
  `created_at` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `activity_logs_created_at_idx` (`created_at`),
  KEY `activity_logs_actor_created_at_idx` (`actor_id`, `created_at`),
  KEY `activity_logs_resource_created_at_idx` (`resource`, `resource_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
