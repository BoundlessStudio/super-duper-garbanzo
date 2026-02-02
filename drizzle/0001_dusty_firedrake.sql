CREATE TABLE `meetings` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`meeting_url` text NOT NULL,
	`conversation_id` text,
	`status` text DEFAULT 'Scheduled' NOT NULL,
	`participants` text DEFAULT '' NOT NULL,
	`duration` text,
	`notes` text DEFAULT '' NOT NULL,
	`recording_url` text,
	`scheduled_at` text NOT NULL,
	`created_at` text NOT NULL
);
