CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`task_id` text NOT NULL,
	`activity` text NOT NULL,
	`note` text NOT NULL,
	`date` text NOT NULL,
	`author` text NOT NULL,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`assignment` text NOT NULL,
	`due_date` text NOT NULL,
	`status` text DEFAULT 'Not Started' NOT NULL,
	`created_at` text NOT NULL
);
