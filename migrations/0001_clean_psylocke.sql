CREATE TABLE `user_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`phone_number` text NOT NULL,
	`birth_date` text NOT NULL,
	`gender` text NOT NULL,
	`status` text NOT NULL,
	`school` text,
	`major` text,
	`year` text,
	`fees_amount` text NOT NULL,
	`payment_status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
