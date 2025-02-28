// src/db/schema.ts
import { sqliteTable, text, integer} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";


export const users=sqliteTable("users",{
    userID:text().primaryKey().unique(),
    name: text().notNull(),
    email: text().notNull().unique(),
    remainingChats: integer().notNull().default(5),
    accountCreated: text().notNull().default(sql`CURRENT_TIMESTAMP`),
});


