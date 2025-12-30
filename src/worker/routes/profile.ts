import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { auth } from "../../lib/auth";
import { userProfiles } from "../../lib/schemas";

type Env = {
    d1_cfw: D1Database;
};

const app = new Hono<{ Bindings: Env }>();

// Validation schema
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

// GET /api/profile - Get current user's profile
app.get("/", async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const db = drizzle(c.env.d1_cfw);
    const profile = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, session.user.id))
        .get();

    if (!profile) {
        return c.json({ error: "Profile not found" }, 404);
    }

    return c.json(profile);
});

// POST /api/profile - Create or update profile
app.post("/", async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const result = profileSchema.safeParse(body);

    if (!result.success) {
        return c.json({ error: "Invalid data", details: result.error.issues }, 400);
    }

    const data = result.data;

    // Fee logic: FSTM = 49 DH, External = 79 DH
    const feesAmount = data.status === "FSTM" ? "49 DH" : "79 DH";
    const school = data.status === "FSTM" ? "FSTM" : (data.school || "Unknown");

    const db = drizzle(c.env.d1_cfw);

    // Check if profile exists
    const existing = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, session.user.id))
        .get();

    if (existing) {
        // Update existing profile
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
            .where(eq(userProfiles.userId, session.user.id))
            .execute();
    } else {
        // Create new profile
        await db
            .insert(userProfiles)
            .values({
                id: nanoid(),
                userId: session.user.id,
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
