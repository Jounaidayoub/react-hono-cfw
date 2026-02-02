import { createHonoApp } from "../app";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";
import { auth } from "../../lib/auth";
import { eventFormSchema } from "../../lib/schemas";
import {
  createEvent,
  getEventById,
  listEvents,
  updateEvent,
  deleteEvent,
  getActiveQrCode,
  getEventAttendees,
} from "../services/event-service";
import { processCheckin } from "../services/checkin-service";

const app = createHonoApp();

// we duplicate authMiddleware and adminMiddleware just for the checkin route
// because it needs to be unauthenticated for some users

/**
 * POST /api/events - Create event 
 */
app.post("/", authMiddleware, adminMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();

  const result = eventFormSchema.safeParse(body);
  if (!result.success) {
    return c.json({ error: "Invalid data", details: result.error.issues }, 400);
  }

  const event = await createEvent(
    {
      ...result.data,
      startsAt: new Date(result.data.startsAt),
      endsAt: new Date(result.data.endsAt),
    },
    user.id
  );
  return c.json({event}, 201);
});

/**
 * GET /api/events - List all events 
 */
app.get("/", authMiddleware, adminMiddleware, async (c) => {
  const events = await listEvents();
  return c.json({events});
});

/**
 * GET /api/events/:id - Get event details 
 */
app.get("/:id", authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param("id");
  const event = await getEventById(id);

  if (!event) {
    return c.json({ error: "Event not found" }, 404);
  }

  return c.json({event});
});

/**
 * PATCH /api/events/:id - Update event 
 */
app.patch("/:id", authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  // Validate partial update
  const partialSchema = eventFormSchema.partial();
  const result = partialSchema.safeParse(body);
  if (!result.success) {
    return c.json({ error: "Invalid data", details: result.error.issues }, 400);
  }

  const { startsAt, endsAt, ...restData } = result.data;
  const event = await updateEvent(id, {
    ...restData,
    ...(startsAt ? { startsAt: new Date(startsAt) } : {}),
    ...(endsAt ? { endsAt: new Date(endsAt) } : {}),
  });
  if (!event) {
    return c.json({ error: "Event not found" }, 404);
  }

  return c.json({event});
});

/**
 * DELETE /api/events/:id - Delete event 
 */
app.delete("/:id", authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param("id");
  const deleted = await deleteEvent(id);

  if (!deleted) {
    return c.json({ error: "Event not found" }, 404);
  }

  return c.json({ success: true });
});

/**
 * GET /api/events/:id/qr - Get current rotating QR code 
 */
app.get("/:id/qr", authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param("id");

  // Build base URL from request
  const url = new URL(c.req.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  const qrData = await getActiveQrCode(id, baseUrl);
  if (!qrData) {
    return c.json({ error: "Event not found" }, 404);
  }

  return c.json({qrData});
});

/**
 * GET /api/events/:id/attendees - List users who checked in 
 */
app.get("/:id/attendees", authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param("id");

  const event = await getEventById(id);
  if (!event) {
    return c.json({ error: "Event not found" }, 404);
  }

  const attendees = await getEventAttendees(id);
  return c.json({attendees});
});

/**
 * GET /api/events/:eventId/checkin?code={secret} - Process check-in
 * This endpoint is special: it handles unauthenticated users by redirecting to login
 */
app.get("/:eventId/checkin", async (c) => {
  const eventId = c.req.param("eventId");
  const code = c.req.query("code");

  if (!code) {
    return c.redirect("/checkin/error?error=INVALID_CODE");
  }

  // Check authentication
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  const userId = session?.user?.id ?? null;

  // If not authenticated, redirect to login with return URL
  if (!userId) {
    const loginUrl = new URL("/login", c.req.url);
    loginUrl.searchParams.set("returnTo", c.req.url);
    return c.redirect(loginUrl.toString());
  }

  // Process the check-in
  const result = await processCheckin(userId, eventId, code);

  if (!result.success) {
    const errorUrl = new URL("/checkin/error", c.req.url);
    errorUrl.searchParams.set("error", result.error);
    return c.redirect(errorUrl.toString());
  }

  // Success - redirect to success page
  const successUrl = new URL("/checkin/success", c.req.url);
  successUrl.searchParams.set("xp", result.xpAwarded.toString());
  successUrl.searchParams.set("event", result.eventName);
  successUrl.searchParams.set("total", result.totalXp.toString());
  return c.redirect(successUrl.toString());
});

export default app;
