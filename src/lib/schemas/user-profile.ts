import { InferInsertModel, InferSelectModel, sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { z } from "zod";
import { user } from "./auth-schema";

export const userProfiles = sqliteTable("user_profiles", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    phoneNumber: text("phone_number").notNull(),
    birthDate: text("birth_date").notNull(), // ISO string YYYY-MM-DD
    gender: text("gender").notNull(), // 'Male' | 'Female'
    status: text("status").notNull(), // 'FSTM' | 'External'
    school: text("school"), // Forced to 'FSTM' if status is FSTM
    major: text("major"),
    year: text("year"),
    feesAmount: text("fees_amount").notNull(), // '49 DH' | '79 DH'
    paymentStatus: text("payment_status").notNull().default("pending"), // 'pending' | 'paid'
    createdAt: integer("created_at", { mode: "timestamp_ms" })
        .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
        .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
        .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
        .$onUpdate(() => new Date())
        .notNull(),
});

export type UserProfile = InferSelectModel<typeof userProfiles>;
export type UserProfileInsert = InferInsertModel<typeof userProfiles>;

export const userProfileSelectSchema = createSelectSchema(userProfiles);
export const userProfileInsertSchema = createInsertSchema(userProfiles);
// here we should use drizzle-zod to avoid drifting away from the actual schema, 
export const profileFormSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phoneNumber: z
        .string()
        .min(10, "Phone number must be at least 10 digits"),
    birthDate: z.string().min(1, "Birth date is required"),
    gender: z.enum(["Male", "Female"]),
    status: z.enum(["FSTM", "External"]),
    school: z.string().optional(),
    major: z.string().optional(),
    year: z.string().optional(),
});

export const paymentStatusSchema = z.object({
    paymentStatus: z.enum(["pending", "paid"]),
});

export type ProfileFormData = z.infer<typeof profileFormSchema>;
