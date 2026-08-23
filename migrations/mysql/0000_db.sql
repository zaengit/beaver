CREATE TABLE `roles` (
  `id` varchar(26) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text,
  `is_system` int NOT NULL DEFAULT 0,
  `created_at` bigint NOT NULL,
  `updated_at` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
--> statement-breakpoint

CREATE TABLE `permissions` (
  `id` varchar(26) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `group` varchar(64) NOT NULL,
  `description` text,
  `created_at` bigint NOT NULL,
  `updated_at` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `permissions_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
--> statement-breakpoint

CREATE TABLE `users` (
  `id` varchar(26) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role_id` varchar(26),
  `email_verified` int NOT NULL DEFAULT 0,
  `created_at` bigint NOT NULL,
  `updated_at` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  CONSTRAINT `users_role_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
--> statement-breakpoint

CREATE TABLE `admin_refresh_sessions` (
  `id` varchar(26) NOT NULL,
  `user_id` varchar(26) NOT NULL,
  `expires_at` bigint NOT NULL,
  `created_at` bigint NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `admin_refresh_sessions_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
--> statement-breakpoint

CREATE TABLE `password_reset_tokens` (
  `id` varchar(26) NOT NULL,
  `user_id` varchar(26) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` bigint NOT NULL,
  `created_at` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `password_reset_tokens_token_unique` (`token`),
  CONSTRAINT `password_reset_tokens_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
--> statement-breakpoint

CREATE TABLE `categories` (
  `id` varchar(26) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `type` varchar(64) NOT NULL DEFAULT 'post',
  `description` text,
  `image` text,
  `status` varchar(32) NOT NULL DEFAULT 'published',
  `created_at` bigint NOT NULL,
  `updated_at` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
--> statement-breakpoint

CREATE TABLE `posts` (
  `id` varchar(26) NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `type` varchar(64) NOT NULL DEFAULT 'post',
  `status` varchar(32) NOT NULL DEFAULT 'draft',
  `excerpt` text,
  `description` text,
  `tags` text,
  `sections` text,
  `custom_field_values` text,
  `meta_title` text,
  `meta_description` text,
  `featured_image` text,
  `gallery` text,
  `author_id` varchar(26) NOT NULL,
  `published_at` bigint,
  `created_at` bigint NOT NULL,
  `updated_at` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `posts_slug_unique` (`slug`),
  CONSTRAINT `posts_author_id_fk` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
--> statement-breakpoint

CREATE TABLE `post_categories` (
  `id` varchar(26) NOT NULL,
  `post_id` varchar(26) NOT NULL,
  `category_id` varchar(26) NOT NULL,
  `created_at` bigint NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `post_categories_post_id_fk` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `post_categories_category_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
--> statement-breakpoint

CREATE TABLE `role_permissions` (
  `id` varchar(26) NOT NULL,
  `role_id` varchar(26) NOT NULL,
  `permission_id` varchar(26) NOT NULL,
  `created_at` bigint NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `role_permissions_role_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_permissions_permission_id_fk` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
--> statement-breakpoint

CREATE TABLE `media` (
  `id` varchar(26) NOT NULL,
  `user_id` varchar(26) NOT NULL,
  `name` varchar(255) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `mime_type` varchar(255) NOT NULL,
  `size` bigint NOT NULL,
  `url` text NOT NULL,
  `thumbnail_url` text,
  `alt` text,
  `caption` text,
  `width` int,
  `height` int,
  `folder` varchar(255),
  `created_at` bigint NOT NULL,
  `updated_at` bigint NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `media_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
--> statement-breakpoint

CREATE TABLE `menus` (
  `id` varchar(26) NOT NULL,
  `title` varchar(255) NOT NULL,
  `url` text NOT NULL,
  `type` varchar(32) NOT NULL,
  `position` int NOT NULL DEFAULT 0,
  `parent_id` varchar(26),
  `css_class` varchar(255),
  `target` varchar(32),
  `image` text,
  `status` varchar(32) NOT NULL DEFAULT 'published',
  `created_at` bigint NOT NULL,
  `updated_at` bigint NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `menus_parent_id_fk` FOREIGN KEY (`parent_id`) REFERENCES `menus` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
--> statement-breakpoint

CREATE TABLE `settings` (
  `key` varchar(255) NOT NULL,
  `value` text NOT NULL,
  `created_at` bigint NOT NULL,
  `updated_at` bigint NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
