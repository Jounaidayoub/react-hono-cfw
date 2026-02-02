import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { user } from "./auth-schema";

export const events = sqliteTable(
  "events",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    location: text("location"),
    startsAt: integer("starts_at", { mode: "timestamp_ms" }).notNull(),
    endsAt: integer("ends_at", { mode: "timestamp_ms" }).notNull(),
    qrRotationSeconds: integer("qr_rotation_seconds").notNull().default(30),
    currentQrSecret: text("current_qr_secret"),
    qrExpiresAt: integer("qr_expires_at", { mode: "timestamp_ms" }),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch() * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch() * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("events_starts_at_idx").on(table.startsAt),
    index("events_ends_at_idx").on(table.endsAt),
  ]
);

// Drizzle inferred types
export type Event = InferSelectModel<typeof events>;
export type EventInsert = InferInsertModel<typeof events>;
export type EventUpdate = Partial<
  Omit<EventInsert, "id" | "createdAt" | "createdBy">
>;

// Zod schemas
export const eventSelectSchema = createSelectSchema(events);
export const eventInsertSchema = createInsertSchema(events, {
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  location: z.string().max(500).optional(),
  startsAt: z.date(),
  endsAt: z.date(),
  qrRotationSeconds: z.number().int().min(10).max(300).default(30),
});

// Schema for creating/updating events from API (without internal fields)
export const eventFormSchema = z.object({
  name: z.string().min(1, "Event name is required").max(200),
  description: z.string().max(2000).optional(),
  location: z.string().max(500).optional(),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  qrRotationSeconds: z.number().int().min(10).max(300).default(30),
}).refine((data) => data.endsAt > data.startsAt, {
  message: "End time must be after start time",
  path: ["endsAt"],
});

export type EventSelect = z.infer<typeof eventSelectSchema>;
export type EventInsertZod = z.infer<typeof eventInsertSchema>;
export type EventFormData = z.infer<typeof eventFormSchema>;
