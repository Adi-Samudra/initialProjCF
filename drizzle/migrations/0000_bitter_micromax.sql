CREATE TABLE `users` (
	`userID` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`remainingChats` integer DEFAULT 5 NOT NULL,
	`accountCreated` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_userID_unique` ON `users` (`userID`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);