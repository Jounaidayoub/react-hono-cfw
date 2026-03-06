import { ResultAsync, errAsync, okAsync } from "neverthrow";
import { awardActivity, getUserXp } from "../services/xp-service";
import type { DomainResultAsync } from "../domain/result";

/**
 * Award check-in XP to a user for an event.
 * Returns Ok(xpAwarded) on success.
 * Returns Err(ALREADY_CHECKED_IN) if the user already checked in.
 * Returns Err(INFRASTRUCTURE_ERROR) for unexpected failures.
 */
export function awardCheckinXp(
  userId: string,
  eventId: string
): DomainResultAsync<number> {
  return ResultAsync.fromPromise(
    awardActivity(userId, "MEETUP_ATTENDANCE", eventId, "event"),
    (cause) => ({
      tag: "INFRASTRUCTURE_ERROR" as const,
      operation: `awardCheckinXp(${userId}, ${eventId})`,
      cause,
    })
  ).andThen((result) => {
    if (result.success) {
      return okAsync(result.xpAwarded);
    }
    if (result.error === "ALREADY_AWARDED") {
      return errAsync({
        tag: "ALREADY_CHECKED_IN" as const,
        userId,
        eventId,
      });
    }
    return errAsync({
      tag: "INFRASTRUCTURE_ERROR" as const,
      operation: `awardCheckinXp(${userId}, ${eventId})`,
      cause: result.error,
    });
  });
}

/**
 * Get a user's total XP.
 * Returns Ok(totalXp) on success.
 * Returns Err(INFRASTRUCTURE_ERROR) for DB failures.
 */
export function getUserTotalXp(userId: string): DomainResultAsync<number> {
  return ResultAsync.fromPromise(
    getUserXp(userId),
    (cause) => ({
      tag: "INFRASTRUCTURE_ERROR" as const,
      operation: `getUserTotalXp(${userId})`,
      cause,
    })
  );
}
