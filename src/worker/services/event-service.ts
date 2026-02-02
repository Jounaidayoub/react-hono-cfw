import { eq, and, lte, gte } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../../lib/db";
import {
  events,
  userActivities,
  user,
  type Event,
  type EventInsert,
  type EventUpdate,
} from "../../lib/schemas";

export type QrCodeData = {
  qrContent: string;
  expiresAt: Date;
  ttlSeconds: number;
  rotationSeconds: number;
};

/**
 * Create a new event
 */
export async function createEvent(
  data: Omit<EventInsert, "id" | "createdAt" | "updatedAt" | "createdBy">,
  createdBy: string
): Promise<Event> {
  const id = nanoid();

  const newEvent: EventInsert = {
    id,
    ...data,
    createdBy,
  };

  await db.insert(events).values(newEvent);

  const created = await db.select().from(events).where(eq(events.id, id)).get();
  if (!created) {
    throw new Error("Failed to create event");
  }

  return created;
}

/**
 * Get event by ID
 */
export async function getEventById(eventId: string): Promise<Event | null> {
  const event = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .get();

  return event ?? null;
}

/**
 * List all events (ordered by start date, newest first)
 */
export async function listEvents(): Promise<Event[]> {
  return db.select().from(events).orderBy(events.startsAt).all();
}

/**
 * List currently active events (started but not ended)
 */
export async function listActiveEvents(): Promise<Event[]> {
  const now = new Date();
  return db
    .select()
    .from(events)
    .where(and(lte(events.startsAt, now), gte(events.endsAt, now)))
    .all();
}

/**
 * Update an event
 */
export async function updateEvent(
  eventId: string,
  data: EventUpdate
): Promise<Event | null> {
  await db
    .update(events)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(events.id, eventId));

  return getEventById(eventId);
}

/**
 * Delete an event
 */
export async function deleteEvent(eventId: string): Promise<boolean> {
  // Check if event exists before deleting
  const existing = await getEventById(eventId);
  if (!existing) {
    return false;
  }
  await db.delete(events).where(eq(events.id, eventId));
  return true;
}

/**
 * Check if an event is currently active (within time window)
 */
export function isEventActive(event: Event): boolean {
  const now = new Date();
  return event.startsAt <= now && event.endsAt >= now;
}

/**
 * Generate a new QR secret for an event
 * Format: evt_{eventId}_{timestamp}_{nanoid(8)}
 */
export function generateQrSecret(eventId: string): string {
  const timestamp = Date.now();
  const random = nanoid(8);
  return `evt_${eventId}_${timestamp}_${random}`;
}

/**
 * Get or generate an active QR code for an event
 * Auto-rotates expired codes
 */
export async function getActiveQrCode(
  eventId: string,
  baseUrl: string
): Promise<QrCodeData | null> {
  const event = await getEventById(eventId);
  if (!event) {
    return null;
  }

  const now = new Date();

  // Check if current QR is still valid
  if (event.currentQrSecret && event.qrExpiresAt && event.qrExpiresAt > now) {
    const ttlSeconds = Math.floor(
      (event.qrExpiresAt.getTime() - now.getTime()) / 1000
    );
    return {
      qrContent: buildCheckinUrl(baseUrl, eventId, event.currentQrSecret),
      expiresAt: event.qrExpiresAt,
      ttlSeconds,
      rotationSeconds: event.qrRotationSeconds,
    };
  }

  // Generate new QR code
  const newSecret = generateQrSecret(eventId);
  const expiresAt = new Date(now.getTime() + event.qrRotationSeconds * 1000);

  await db
    .update(events)
    .set({
      currentQrSecret: newSecret,
      qrExpiresAt: expiresAt,
      updatedAt: now,
    })
    .where(eq(events.id, eventId));

  return {
    qrContent: buildCheckinUrl(baseUrl, eventId, newSecret),
    expiresAt,
    ttlSeconds: event.qrRotationSeconds,
    rotationSeconds: event.qrRotationSeconds,
  };
}

/**
 * Build the check-in URL that will be encoded in the QR code
 */
function buildCheckinUrl(
  baseUrl: string,
  eventId: string,
  secret: string
): string {
  const url = new URL(`/api/events/${eventId}/checkin`, baseUrl);
  url.searchParams.set("code", secret);
  return url.toString();
}

/**
 * Get list of users who checked in to an event
 */
export async function getEventAttendees(eventId: string): Promise<
  Array<{
    userId: string;
    userName: string;
    userEmail: string;
    checkedInAt: Date;
    xpAwarded: number;
  }>
> {
  const activities = await db
    .select({
      userId: userActivities.userId,
      userName: user.name,
      userEmail: user.email,
      checkedInAt: userActivities.createdAt,
      xpAwarded: userActivities.xpAwarded,
    })
    .from(userActivities)
    .innerJoin(user, eq(userActivities.userId, user.id))
    .where(
      and(
        eq(userActivities.referenceId, eventId),
        eq(userActivities.referenceType, "event")
      )
    )
    .all();

  return activities;
}
