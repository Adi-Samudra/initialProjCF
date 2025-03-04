// src/db/schema.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Enums (we can modify these values later)
export const occasionEnum = ["wedding", "haldi", "diwali"] as const;
export const wearTypeEnum = ["traditional", "western", "fusion"] as const;
export const senderEnum = ["user", "designer"] as const;
export const appointmentStatusEnum = ["notRequested", "pending", "done"] as const;

export const users = sqliteTable("users", {
    userID: text("userID", { length: 10 }).primaryKey().unique(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    phoneNumber: text("phoneNumber", { length: 10 }).notNull(),
    remainingChats: integer("remainingChats").notNull().default(5),
});

export const chats = sqliteTable("chats", {
    chatID: text("chatID", { length: 8 }).primaryKey().unique(),
    userID: text("userID", { length: 10 })
        .notNull()
        .references(() => users.userID),
    occasion: text("occasion").notNull(),
    wearType: text("wearType").notNull(),
    dateCreated: text("dateCreated").notNull().default(sql`CURRENT_TIMESTAMP`),
    lastModified: text("lastModified").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const chatGallery = sqliteTable("chatGallery", {
    chatID: text("chatID", { length: 8 })
        .notNull()
        .references(() => chats.chatID),
    imageURL: text("imageURL").notNull(),
});

export const messages = sqliteTable("messages", {
    messageID: text("messageID", { length: 10 }).primaryKey().unique(),
    chatID: text("chatID", { length: 8 })
        .notNull()
        .references(() => chats.chatID),
    messageText: text("messageText"),
    sender: text("sender").notNull(),
    createdAt: text("createdAt").notNull().default(sql`CURRENT_TIMESTAMP`),
    imageGenerated: integer("imageGenerated").notNull().default(0),
    generatedImageURL: text("generatedImageURL"),
    hasImage: integer("hasImage").notNull().default(0),
    imageURL: text("imageURL"),
});

export const appointments = sqliteTable("appointments", {
    chatID: text("chatID", { length: 8 })
        .primaryKey()
        .references(() => chats.chatID),
    status: text("status").notNull().default("notRequested"),
    requestedAt: text("requestedAt").default(sql`CURRENT_TIMESTAMP`),
    acceptedAt: text("acceptedAt"),
});

export const admin = sqliteTable("admin", {
    adminID: text("adminID", { length: 10 }).primaryKey().unique(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
});


