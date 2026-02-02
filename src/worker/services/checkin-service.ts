import { eq, inArray } from "drizzle-orm";
import { db } from "../../lib/db";
import { userActivities, events } from "../../lib/schemas";
import { awardActivity, getUserXp } from "./xp-service";
import { getEventById, isEventActive } from "./event-service";

export type CheckinResult =
  | {
      success: true;
      xpAwarded: number;
      eventName: string;
      totalXp: number;
    }
  | {
      success: false;
      error:
        | "NOT_AUTHENTICATED"
        | "EVENT_NOT_FOUND"
        | "EVENT_NOT_ACTIVE"
        | "INVALID_CODE"
        | "CODE_EXPIRED"
        | "ALREADY_CHECKED_IN";
    };

export type UserCheckin = {
  activityId: string;
  eventId: string;
  eventName: string;
  xpAwarded: number;
  checkedInAt: Date;
};

/**
 * Process a check-in attempt.
 * Validates the QR code and awards XP if valid.
 */
export async function processCheckin(
  userId: string | null,
  eventId: string,
  qrCode: string
): Promise<CheckinResult> {
  //  Check authentication
  if (!userId) {
    return { success: false, error: "NOT_AUTHENTICATED" };
  }

  //  Fetch event
  const event = await getEventById(eventId);
  if (!event) {
    return { success: false, error: "EVENT_NOT_FOUND" };
  }

  //  Validate event is active (within time window)
  if (!isEventActive(event)) {
    return { success: false, error: "EVENT_NOT_ACTIVE" };
  }

  //  Validate QR code matches current secret
  if (event.currentQrSecret !== qrCode) {
    return { success: false, error: "INVALID_CODE" };
  }

  //  Validate QR code hasn't expired
  if (!event.qrExpiresAt || event.qrExpiresAt <= new Date()) {
    return { success: false, error: "CODE_EXPIRED" };
  }

  //  Award XP (xp-service handles idempotency)
  const awardResult = await awardActivity(
    userId,
    "MEETUP_ATTENDANCE",
    eventId,
    "event"
  );

  if (!awardResult.success) {
    if (awardResult.error === "ALREADY_AWARDED") {
      return { success: false, error: "ALREADY_CHECKED_IN" };
    }
    // Other errors shouldn't happen for valid event check-ins
    throw new Error(`Unexpected award error: ${awardResult.error}`);
  }

  //  Get updated total XP
  const totalXp = await getUserXp(userId);

  return {
    success: true,
    xpAwarded: awardResult.xpAwarded,
    eventName: event.name,
    totalXp,
  };
}

/**
 * Get a user's check-in history with event names
 */
export async function getUserCheckins(userId: string): Promise<UserCheckin[]> {
  // 1. Fetch all event-type activities for this user
  const activities = await db
    .select()
    .from(userActivities)
    .where(eq(userActivities.userId, userId))
    .all();

  // Filter to only event references
  const eventActivities = activities.filter(
    (a) => a.referenceType === "event" && a.referenceId
  );

  if (eventActivities.length === 0) {
    return [];
  }

  // 2. Batch fetch event names using inArray() (bug fix from prototype)
  const eventIds = eventActivities.map((a) => a.referenceId!);
  const eventRecords = await db
    .select({ id: events.id, name: events.name })
    .from(events)
    .where(inArray(events.id, eventIds))
    .all();

  // Create lookup map
  const eventNameMap = new Map(eventRecords.map((e) => [e.id, e.name]));

  // 3. Build enriched check-in list
  return eventActivities.map((activity) => ({
    activityId: activity.id,
    eventId: activity.referenceId!,
    eventName: eventNameMap.get(activity.referenceId!) ?? "Unknown Event",
    xpAwarded: activity.xpAwarded,
    checkedInAt: activity.createdAt,
  }));
}
