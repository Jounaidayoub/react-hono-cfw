import { eq, sum } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../../lib/db";
import {
  activityTypes,
  userActivities,
  userXpCache,
} from "../../lib/schemas";

export type AwardActivityResult =
  | { success: true; xpAwarded: number; activityId: string }
  | { success: false; error: "ACTIVITY_TYPE_NOT_FOUND" | "ACTIVITY_TYPE_INACTIVE" | "ALREADY_AWARDED" };

/**
 * Award XP activity to a user. Handles idempotency via unique constraint.
 * @param userId - The user receiving the XP
 * @param activityTypeCode - Code like "MEETUP_ATTENDANCE"
 * @param referenceId - Optional ID of related entity (e.g., event ID)
 * @param referenceType - Optional type of reference (e.g., "event")
 */
export async function awardActivity(
  userId: string,
  activityTypeCode: string,
  referenceId?: string,
  referenceType?: string
): Promise<AwardActivityResult> {
  //Find the activity type
  const activityType = await db
    .select()
    .from(activityTypes)
    .where(eq(activityTypes.code, activityTypeCode))
    .get();

  if (!activityType) {
    return { success: false, error: "ACTIVITY_TYPE_NOT_FOUND" };
  }

  if (!activityType.isActive) {
    return { success: false, error: "ACTIVITY_TYPE_INACTIVE" };
  }


  const activityId = nanoid();

  
    const results=await db.insert(userActivities).values({
      id: activityId,
      userId,
      activityTypeId: activityType.id,
      referenceId: referenceId ?? null,
      referenceType: referenceType ?? null,
      xpAwarded: activityType.xpValue,
    }).onConflictDoNothing().returning();
 

  if (results.length === 0) {
    //  No rows inserted - already awarded
    return { success: false, error: "ALREADY_AWARDED" };
  }
  //  Invalidate XP cache 
  await db.delete(userXpCache).where(eq(userXpCache.userId, userId));

  return {
    success: true,
    xpAwarded: activityType.xpValue,
    activityId,
  };
}

/**
 * Get user's total XP (cache-aside pattern: check cache, recalculate if missing)
 */
export async function getUserXp(userId: string): Promise<number> {

  const cached = await db
    .select()
    .from(userXpCache)
    .where(eq(userXpCache.userId, userId))
    .get();

  if (cached) {
    return cached.totalXp;
  }


  return recalculateUserXp(userId);
}

/**
 * Force recalculate user's XP from activities and update cache
 */
export async function recalculateUserXp(userId: string): Promise<number> {
  // Sum all XP from user's activities
  const result = await db
    .select({ total: sum(userActivities.xpAwarded) })
    .from(userActivities)
    .where(eq(userActivities.userId, userId))
    .get();

  const totalXp = Number(result?.total ?? 0);

  // Upsert cache
  await db
    .insert(userXpCache)
    .values({
      userId,
      totalXp,
      lastCalculatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: userXpCache.userId,
      set: {

        totalXp,
        lastCalculatedAt: new Date(),
      },
    });

  return totalXp;
}
