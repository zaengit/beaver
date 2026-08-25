ALTER TABLE `users` ADD COLUMN `role` varchar(32) NULL AFTER `password`;
--> statement-breakpoint

UPDATE `users` AS `u`
LEFT JOIN `roles` AS `r` ON `r`.`id` = `u`.`role_id`
SET `u`.`role` = CASE `r`.`slug`
  WHEN 'super-admin' THEN 'super-admin'
  WHEN 'admin' THEN 'admin'
  WHEN 'editor' THEN 'editor'
  WHEN 'author' THEN 'author'
  ELSE 'author'
END;
--> statement-breakpoint

ALTER TABLE `users` MODIFY COLUMN `role` varchar(32) NOT NULL DEFAULT 'author';
--> statement-breakpoint

ALTER TABLE `users` DROP FOREIGN KEY `users_role_id_fk`;
--> statement-breakpoint

ALTER TABLE `users` DROP COLUMN `role_id`;
--> statement-breakpoint

DROP TABLE `role_permissions`;
--> statement-breakpoint

DROP TABLE `permissions`;
--> statement-breakpoint

DROP TABLE `roles`;
