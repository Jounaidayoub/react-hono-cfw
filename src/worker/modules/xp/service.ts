import { eq, sum } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../../../lib/db";
import { activityTypes, userActivities, userXpCache } from "../../../lib/schemas";
import { error, ok, type Result } from "../../../lib/types";
import type { AwardActivityError } from "./errors";

export type AwardActivityData = {
	xpAwarded: number;
	activityId: string;
};

export async function awardActivity(
	userId: string,
	activityTypeCode: string,
	referenceId?: string,
	referenceType?: string,
): Promise<Result<AwardActivityData, AwardActivityError>> {
	const activityType = await db
		.select()
		.from(activityTypes)
		.where(eq(activityTypes.code, activityTypeCode))
		.get();

	if (!activityType) {
		return error({ type: "XP_ACTIVITY_TYPE_NOT_FOUND" });
	}

	if (!activityType.isActive) {
		return error({ type: "XP_ACTIVITY_TYPE_INACTIVE" });
	}

	const activityId = nanoid();

	const results = await db
		.insert(userActivities)
		.values({
			id: activityId,
			userId,
			activityTypeId: activityType.id,
			referenceId: referenceId ?? null,
			referenceType: referenceType ?? null,
			xpAwarded: activityType.xpValue,
		})
		.onConflictDoNothing()
		.returning();

	if (results.length === 0) {
		return error({ type: "XP_ACTIVITY_ALREADY_AWARDED" });
	}

	await db.delete(userXpCache).where(eq(userXpCache.userId, userId));

	return ok({
		xpAwarded: activityType.xpValue,
		activityId,
	});
}

export async function getUserXp(userId: string): Promise<Result<number, never>> {
	const cached = await db
		.select()
		.from(userXpCache)
		.where(eq(userXpCache.userId, userId))
		.get();

	if (cached) {
		return ok(cached.totalXp);
	}

	return recalculateUserXp(userId);
}

export async function recalculateUserXp(userId: string): Promise<Result<number, never>> {
	const result = await db
		.select({ total: sum(userActivities.xpAwarded) })
		.from(userActivities)
		.where(eq(userActivities.userId, userId))
		.get();

	const totalXp = Number(result?.total ?? 0);

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

	return ok(totalXp);
}