CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`age` integer NOT NULL,
	`gender` text NOT NULL,
	`contact_type` text NOT NULL,
	`contact` text NOT NULL,
	`passport` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`game` integer NOT NULL,
	`accuracy` integer NOT NULL,
	`speed` integer NOT NULL,
	`level` integer NOT NULL
);
