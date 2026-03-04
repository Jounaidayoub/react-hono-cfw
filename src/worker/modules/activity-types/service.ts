import { eq } from "drizzle-orm";
import { db } from "../../../lib/db";
import { activityTypes } from "../../../lib/schemas";
import type { ActivityType, ActivityTypeUpdate } from "../../../lib/schemas";
import { err, ok, type Result } from "../../../lib/types";

export async function listActivityTypes(): Promise<Result<ActivityType[]>> {
	const types = await db.select().from(activityTypes).all();
	return ok(types);
}

export async function getActivityTypeById(
	id: string,
): Promise<Result<ActivityType>> {
	const activityType = await db
		.select()
		.from(activityTypes)
		.where(eq(activityTypes.id, id))
		.get();

	if (!activityType) {
		return err("NOT_FOUND", "Activity type not found");
	}

	return ok(activityType);
}

export async function updateActivityType(
	id: string,
	data: ActivityTypeUpdate,
): Promise<Result<ActivityType>> {
	const existing = await db
		.select()
		.from(activityTypes)
		.where(eq(activityTypes.id, id))
		.get();

	if (!existing) {
		return err("NOT_FOUND", "Activity type not found");
	}

	const [updated] = await db
		.update(activityTypes)
		.set({
			...data,
			updatedAt: new Date(),
		})
		.where(eq(activityTypes.id, id))
		.returning();

	if (!updated) {
		return err("INTERNAL_ERROR", "Failed to update activity type");
	}

	return ok(updated);
}