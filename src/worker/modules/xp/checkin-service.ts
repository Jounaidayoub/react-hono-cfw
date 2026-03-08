import { and, eq, inArray } from "drizzle-orm";
import { db } from "../../../lib/db";
import { events, userActivities } from "../../../lib/schemas";
import { error, ok, type Result } from "../../../lib/types";
import { getEventById, isEventActive } from "../events/service";
import { awardActivity, getUserXp } from "./service";
import type { ProcessCheckinError } from "./errors";

export type CheckinData = {
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

export async function processCheckin(
	userId: string | null,
	eventId: string,
	qrCode: string,
): Promise<Result<CheckinData, ProcessCheckinError>> {
	if (!userId) {
		return error({ type: "XP_NOT_AUTHENTICATED" });
	}

	const eventResult = await getEventById(eventId);

	if (!eventResult.ok) {
		return error({ type: "XP_EVENT_NOT_FOUND" });
	}

	const event = eventResult.data;

	if (!isEventActive(event)) {
		return error({ type: "XP_EVENT_NOT_ACTIVE" });
	}

	if (event.currentQrSecret !== qrCode) {
		return error({ type: "XP_INVALID_CODE" });
	}

	if (!event.qrExpiresAt || event.qrExpiresAt <= new Date()) {
		return error({ type: "XP_CODE_EXPIRED" });
	}

	const awardResult = await awardActivity(
		userId,
		"MEETUP_ATTENDANCE",
		eventId,
		"event",
	);

	if (!awardResult.ok) {
		if (awardResult.error.type === "XP_ACTIVITY_ALREADY_AWARDED") {
			return error({ type: "XP_ACTIVITY_ALREADY_AWARDED" });
		}

		return error({ type: "XP_AWARD_FAILED" });
	}

	const totalXpResult = await getUserXp(userId);

	if (!totalXpResult.ok) {
		return totalXpResult;
	}

	return ok({
		xpAwarded: awardResult.data.xpAwarded,
		eventName: event.name,
		totalXp: totalXpResult.data,
	});
}

export async function getUserCheckins(
	userId: string,
): Promise<Result<UserCheckin[], never>> {
	const activities = await db
		.select()
		.from(userActivities)
		.where(and(eq(userActivities.userId, userId), eq(userActivities.referenceType, "event")))
		.all();

	if (activities.length === 0) {
		return ok([]);
	}

	const eventIds = activities
		.map(activity => activity.referenceId)
		.filter((eventId): eventId is string => Boolean(eventId));

	if (eventIds.length === 0) {
		return ok([]);
	}

	const eventRecords = await db
		.select({ id: events.id, name: events.name })
		.from(events)
		.where(inArray(events.id, eventIds))
		.all();

	const eventNameMap = new Map(eventRecords.map(event => [event.id, event.name]));

	return ok(
		activities
			.filter(activity => activity.referenceId)
			.map(activity => ({
				activityId: activity.id,
				eventId: activity.referenceId as string,
				eventName: eventNameMap.get(activity.referenceId as string) ?? "Unknown Event",
				xpAwarded: activity.xpAwarded,
				checkedInAt: activity.createdAt,
			})),
	);
}