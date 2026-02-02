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
  startsAt: z.string().min(1, "Start time is required"),
  endsAt: z.string().min(1, "End time is required"),
  qrRotationSeconds: z.number().int().min(10).max(300),
}).refine((data) => {
  const start = new Date(data.startsAt);
  const end = new Date(data.endsAt);
  return end > start;
}, {
  message: "End time must be after start time",
  path: ["endsAt"],
});

export type EventSelect = z.infer<typeof eventSelectSchema>;
export type EventInsertZod = z.infer<typeof eventInsertSchema>;
export type EventFormData = z.infer<typeof eventFormSchema>;

// QR code response schema
export const qrDataSchema = z.object({
  qrContent: z.string(),
  expiresAt: z.coerce.date(),
  ttlSeconds: z.number(),
  rotationSeconds: z.number(),
});

export type QRData = z.infer<typeof qrDataSchema>;

// Event attendee schema
export const attendeeSchema = z.object({
  userId: z.string(),
  userName: z.string().nullable(),
  userEmail: z.string(),
  checkedInAt: z.coerce.date(),
  xpAwarded: z.number(),
});

export type Attendee = z.infer<typeof attendeeSchema>;

// Helper to get event status
export function getEventStatus(
  event: Event
): "upcoming" | "active" | "ended" {
  const now = new Date();
  if (now < event.startsAt) return "upcoming";
  if (now > event.endsAt) return "ended";
  return "active";
}

// Helper to format date for datetime-local input
export function formatDateTimeLocal(date: Date): string {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
}
