import { eq } from "drizzle-orm";
import { db } from "../../../lib/db";
import { activityTypes } from "../../../lib/schemas";
import type { ActivityType, ActivityTypeUpdate } from "../../../lib/schemas";
import { error, ok, type Result } from "../../../lib/types";
import type {
	GetActivityTypeError,
	UpdateActivityTypeError,
} from "./errors";

export async function listActivityTypes(): Promise<Result<ActivityType[], never>> {
	const types = await db.select().from(activityTypes).all();
	return ok(types);
}

export async function getActivityTypeById(
	id: string,
): Promise<Result<ActivityType, GetActivityTypeError>> {
	const activityType = await db
		.select()
		.from(activityTypes)
		.where(eq(activityTypes.id, id))
		.get();

	if (!activityType) {
		return error({ type: "ACTIVITY_TYPE_NOT_FOUND" });
	}

	return ok(activityType);
}

export async function updateActivityType(
	id: string,
	data: ActivityTypeUpdate,
): Promise<Result<ActivityType, UpdateActivityTypeError>> {
	const existing = await db
		.select()
		.from(activityTypes)
		.where(eq(activityTypes.id, id))
		.get();

	if (!existing) {
		return error({ type: "ACTIVITY_TYPE_NOT_FOUND" });
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
		return error({ type: "ACTIVITY_TYPE_UPDATE_FAILED" });
	}

	return ok(updated);
}