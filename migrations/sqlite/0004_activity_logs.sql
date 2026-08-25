CREATE TABLE `activity_logs` (
  `id` text PRIMARY KEY NOT NULL,
  `actor_id` text,
  `actor_name` text,
  `actor_email` text,
  `action` text NOT NULL,
  `resource` text NOT NULL,
  `resource_id` text,
  `metadata` text,
  `ip_address` text,
  `user_agent` text,
  `success` integer NOT NULL DEFAULT 1,
  `status_code` integer NOT NULL DEFAULT 200,
  `created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `activity_logs_created_at_idx` ON `activity_logs` (`created_at`);
--> statement-breakpoint
CREATE INDEX `activity_logs_actor_created_at_idx` ON `activity_logs` (`actor_id`, `created_at`);
--> statement-breakpoint
CREATE INDEX `activity_logs_resource_created_at_idx` ON `activity_logs` (`resource`, `resource_id`, `created_at`);
