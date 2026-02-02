import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
  index,
} from "drizzle-orm/sqlite-core";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { user } from "./auth-schema";
import { activityTypes } from "./activity-types";

export const userActivities = sqliteTable(
  "user_activities",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    activityTypeId: text("activity_type_id")
      .notNull()
      .references(() => activityTypes.id, { onDelete: "cascade" }),
    referenceId: text("reference_id"),
    referenceType: text("reference_type"),
    xpAwarded: integer("xp_awarded").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch() * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("user_activities_unique_idx").on(
      table.userId,
      table.referenceId,
      table.referenceType
    ),
    index("user_activities_user_id_idx").on(table.userId),
  ]
);

// Drizzle inferred types
export type UserActivity = InferSelectModel<typeof userActivities>;
export type UserActivityInsert = InferInsertModel<typeof userActivities>;

// Zod schemas
export const userActivitySelectSchema = createSelectSchema(userActivities);
export const userActivityInsertSchema = createInsertSchema(userActivities, {
  userId: z.string().min(1),
  activityTypeId: z.string().min(1),
  referenceId: z.string().optional(),
  referenceType: z.string().optional(),
  xpAwarded: z.number().int().min(0),
});

export type UserActivitySelect = z.infer<typeof userActivitySelectSchema>;
export type UserActivityInsertZod = z.infer<typeof userActivityInsertSchema>;
