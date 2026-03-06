import { eq } from "drizzle-orm";
import { ResultAsync } from "neverthrow";
import { db } from "../../lib/db";
import { events, type Event } from "../../lib/schemas";
import type { DomainResultAsync } from "../domain/result";

/**
 * Find an event by its ID.
 * Returns Ok(Event | null) — null when the event does not exist.
 * Returns Err(INFRASTRUCTURE_ERROR) for thrown DB failures.
 */
export function findEventById(eventId: string): DomainResultAsync<Event | null> {
  return ResultAsync.fromPromise(
    db.select().from(events).where(eq(events.id, eventId)).get().then((row) => row ?? null),
    (cause) => ({
      tag: "INFRASTRUCTURE_ERROR" as const,
      operation: `findEventById(${eventId})`,
      cause,
    })
  );
}
