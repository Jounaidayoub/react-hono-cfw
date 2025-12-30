import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
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
