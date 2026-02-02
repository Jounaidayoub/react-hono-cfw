import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const activityTypes = sqliteTable(
  "activity_types",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    xpValue: integer("xp_value").notNull(),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch() * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch() * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [uniqueIndex("activity_types_code_idx").on(table.code)]
);

// Drizzle inferred types
export type ActivityType = InferSelectModel<typeof activityTypes>;
export type ActivityTypeInsert = InferInsertModel<typeof activityTypes>;

// Zod schemas
export const activityTypeSelectSchema = createSelectSchema(activityTypes);
export const activityTypeInsertSchema = createInsertSchema(activityTypes, {
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  xpValue: z.number().int().min(0),
});

export type ActivityTypeSelect = z.infer<typeof activityTypeSelectSchema>;
export type ActivityTypeInsertZod = z.infer<typeof activityTypeInsertSchema>;
