import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { userProfiles } from "../../lib/schemas";
import { db } from "../../lib/db";
import { createHonoApp } from "../app";
import { authMiddleware } from "../middleware/auth";

const app = createHonoApp();

app.use("*", authMiddleware);

const profileSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
    birthDate: z.string().min(1, "Birth date is required"),
    gender: z.enum(["Male", "Female"]),
    status: z.enum(["FSTM", "External"]),
    school: z.string().optional(),
    major: z.string().optional(),
    year: z.string().optional(),
});

app.get("/", async (c) => {
    const user = c.get("user");

    const profile = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, user.id))
        .get();

    if (!profile) {
        return c.json({ error: "Profile not found" }, 404);
    }

    return c.json(profile);
});

app.post("/", async (c) => {
    const user = c.get("user");

    const body = await c.req.json();
    const result = profileSchema.safeParse(body);

    if (!result.success) {
        return c.json({ error: "Invalid data", details: result.error.issues }, 400);
    }

    const data = result.data;
    const feesAmount = data.status === "FSTM" ? "49 DH" : "79 DH";
    const school = data.status === "FSTM" ? "FSTM" : (data.school || "Unknown");

    const existing = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, user.id))
        .get();

    if (existing) {
        await db
            .update(userProfiles)
            .set({
                firstName: data.firstName,
                lastName: data.lastName,
                phoneNumber: data.phoneNumber,
                birthDate: data.birthDate,
                gender: data.gender,
                status: data.status,
                school,
                major: data.major,
                year: data.year,
                feesAmount,
                updatedAt: new Date(),
            })
            .where(eq(userProfiles.userId, user.id))
            .execute();
    } else {
        await db
            .insert(userProfiles)
            .values({
                id: nanoid(),
                userId: user.id,
                firstName: data.firstName,
                lastName: data.lastName,
                phoneNumber: data.phoneNumber,
                birthDate: data.birthDate,
                gender: data.gender,
                status: data.status,
                school,
                major: data.major,
                year: data.year,
                feesAmount,
                paymentStatus: "pending",
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .execute();
    }

    return c.json({ success: true, feesAmount });
});

export default app;
