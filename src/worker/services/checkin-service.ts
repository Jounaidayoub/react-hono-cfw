import { eq, inArray } from "drizzle-orm";
import { err, ok } from "neverthrow";
import { db } from "../../lib/db";
import { userActivities, events } from "../../lib/schemas";
import { isEventActive } from "./event-service";
import { findEventById } from "../repositories/event-repository";
import { awardCheckinXp, getUserTotalXp } from "../repositories/checkin-repository";
import type { DomainResultAsync } from "../domain/result";

export type ProcessCheckinSuccess = {
  xpAwarded: number;
  eventName: string;
  totalXp: number;
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
 *
 * @param userId - Authenticated user ID (auth check must be done before calling this)
 * @param eventId - The event to check in to
 * @param qrCode - The QR code secret scanned by the user
 */
export function processCheckin(
  userId: string,
  eventId: string,
  qrCode: string
): DomainResultAsync<ProcessCheckinSuccess> {
  return findEventById(eventId)
    .andThen((event) => {
      if (!event) {
        return err({ tag: "EVENT_NOT_FOUND" as const, eventId });
      }

      const now = new Date();

      if (!isEventActive(event)) {
        return err({ tag: "EVENT_NOT_ACTIVE" as const, eventId, now });
      }

      if (event.currentQrSecret !== qrCode) {
        return err({ tag: "INVALID_QR_CODE" as const, eventId });
      }

      if (!event.qrExpiresAt || event.qrExpiresAt <= now) {
        return err({
          tag: "QR_CODE_EXPIRED" as const,
          eventId,
          expiredAt: event.qrExpiresAt ?? null,
        });
      }

      return ok(event);
    })
    .andThen((event) =>
      awardCheckinXp(userId, eventId).map((xpAwarded) => ({
        xpAwarded,
        eventName: event.name,
      }))
    )
    .andThen(({ xpAwarded, eventName }) =>
      getUserTotalXp(userId).map((totalXp) => ({
        xpAwarded,
        eventName,
        totalXp,
      }))
    );
}

/**
 * Get a user's check-in history with event names
 */
export async function getUserCheckins(userId: string): Promise<UserCheckin[]> {
  // FIX : this whole fucntion can be opttimzed 
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

  const eventIds = eventActivities.map((a) => a.referenceId!);
  const eventRecords = await db
    .select({ id: events.id, name: events.name })
    .from(events)
    .where(inArray(events.id, eventIds))
    .all();

  const eventNameMap = new Map(eventRecords.map((e) => [e.id, e.name]));

  return eventActivities.map((activity) => ({
    activityId: activity.id,
    eventId: activity.referenceId!,
    eventName: eventNameMap.get(activity.referenceId!) ?? "Unknown Event",
    xpAwarded: activity.xpAwarded,
    checkedInAt: activity.createdAt,
  }));
}
