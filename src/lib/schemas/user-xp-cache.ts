import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { user } from "./auth-schema";

export const userXpCache = sqliteTable("user_xp_cache", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  totalXp: integer("total_xp").notNull().default(0),
  lastCalculatedAt: integer("last_calculated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch() * 1000 as integer))`)
    .notNull(),
});

// Drizzle inferred types
export type UserXpCache = InferSelectModel<typeof userXpCache>;
export type UserXpCacheInsert = InferInsertModel<typeof userXpCache>;

// Zod schemas
export const userXpCacheSelectSchema = createSelectSchema(userXpCache);
export const userXpCacheInsertSchema = createInsertSchema(userXpCache, {
  userId: z.string().min(1),
  totalXp: z.number().int().min(0).default(0),
});

export type UserXpCacheSelect = z.infer<typeof userXpCacheSelectSchema>;
export type UserXpCacheInsertZod = z.infer<typeof userXpCacheInsertSchema>;
