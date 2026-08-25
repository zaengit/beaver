ALTER TABLE `posts` DROP FOREIGN KEY `posts_author_id_fk`;
--> statement-breakpoint

ALTER TABLE `media` DROP FOREIGN KEY `media_user_id_fk`;
--> statement-breakpoint

UPDATE `posts` AS `p`
JOIN `users` AS `u` ON `u`.`id` = `p`.`author_id`
SET `p`.`author_id` = 'env-super-admin'
WHERE `u`.`role` = 'super-admin';
--> statement-breakpoint

UPDATE `media` AS `m`
JOIN `users` AS `u` ON `u`.`id` = `m`.`user_id`
SET `m`.`user_id` = 'env-super-admin'
WHERE `u`.`role` = 'super-admin';
--> statement-breakpoint

DELETE `s` FROM `admin_refresh_sessions` AS `s`
JOIN `users` AS `u` ON `u`.`id` = `s`.`user_id`
WHERE `u`.`role` = 'super-admin';
--> statement-breakpoint

DELETE `t` FROM `password_reset_tokens` AS `t`
JOIN `users` AS `u` ON `u`.`id` = `t`.`user_id`
WHERE `u`.`role` = 'super-admin';
--> statement-breakpoint

DELETE FROM `users` WHERE `role` = 'super-admin';
