CREATE TABLE `admin` (
	`adminID` text(10) PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_adminID_unique` ON `admin` (`adminID`);--> statement-breakpoint
CREATE UNIQUE INDEX `admin_email_unique` ON `admin` (`email`);--> statement-breakpoint
CREATE TABLE `appointments` (
	`chatID` text(8) PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'notRequested' NOT NULL,
	`requestedAt` text DEFAULT CURRENT_TIMESTAMP,
	`acceptedAt` text,
	FOREIGN KEY (`chatID`) REFERENCES `chats`(`chatID`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `chatGallery` (
	`chatID` text(8) NOT NULL,
	`imageURL` text NOT NULL,
	FOREIGN KEY (`chatID`) REFERENCES `chats`(`chatID`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `chats` (
	`chatID` text(8) PRIMARY KEY NOT NULL,
	`userID` text(10) NOT NULL,
	`occasion` text NOT NULL,
	`wearType` text NOT NULL,
	`dateCreated` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`lastModified` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`userID`) REFERENCES `users`(`userID`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `chats_chatID_unique` ON `chats` (`chatID`);--> statement-breakpoint
CREATE TABLE `messages` (
	`messageID` text(10) PRIMARY KEY NOT NULL,
	`chatID` text(8) NOT NULL,
	`messageText` text,
	`sender` text NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`imageGenerated` integer DEFAULT 0 NOT NULL,
	`generatedImageURL` text,
	`hasImage` integer DEFAULT 0 NOT NULL,
	`imageURL` text,
	FOREIGN KEY (`chatID`) REFERENCES `chats`(`chatID`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `messages_messageID_unique` ON `messages` (`messageID`);--> statement-breakpoint
CREATE TABLE `users` (
	`userID` text(10) PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phoneNumber` text(10) NOT NULL,
	`remainingChats` integer DEFAULT 5 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_userID_unique` ON `users` (`userID`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);