import { eq } from "drizzle-orm";
import { createHonoApp } from "../app";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";
import { db } from "../../lib/db";
import { activityTypes, activityTypeUpdateSchema } from "../../lib/schemas";

const app = createHonoApp();


app.use("*", authMiddleware, adminMiddleware);

/**
 * GET /api/activity-types - List all activity types
 */
app.get("/", async (c) => {
  const types = await db.select().from(activityTypes).all();
  return c.json({types});
});

/**
 * GET /api/activity-types/:id - Get activity type by ID
 */
app.get("/:id", async (c) => {
  const id = c.req.param("id");
  const activityType = await db
    .select()
    .from(activityTypes)
    .where(eq(activityTypes.id, id))
    .get();

  if (!activityType) {
    return c.json({ error: "Activity type not found" }, 404);
  }

  return c.json({activityType});
});

/**
 * PATCH /api/activity-types/:id - Update activity type
 */
app.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  const result = activityTypeUpdateSchema.safeParse(body);
  if (!result.success) {
    return c.json({ error: "Invalid data", details: result.error.issues }, 400);
  }

  // Check if activity type exists
  const existing = await db
    .select()
    .from(activityTypes)
    .where(eq(activityTypes.id, id))
    .get();

  if (!existing) {
    return c.json({ error: "Activity type not found" }, 404);
  }

  // Update
  await db
    .update(activityTypes)
    .set({
      ...result.data,
      updatedAt: new Date(),
    })
    .where(eq(activityTypes.id, id));

  // Return updated record
  const updated = await db
    .select()
    .from(activityTypes)
    .where(eq(activityTypes.id, id))
    .get();

  return c.json({updated});
});

export default app;
