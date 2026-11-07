CREATE TABLE `staff_credentials` (
	`user_id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`salt` text NOT NULL,
	`password_hash` text NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`window_start` integer DEFAULT 0 NOT NULL,
	`session_hash` text,
	`expires_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `staff_credentials_username_unique` ON `staff_credentials` (`username`);