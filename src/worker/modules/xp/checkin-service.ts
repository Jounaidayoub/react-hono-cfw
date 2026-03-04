import { and, eq, inArray } from "drizzle-orm";
import { db } from "../../../lib/db";
import { events, userActivities } from "../../../lib/schemas";
import { err, ok, type Result } from "../../../lib/types";
import { getEventById, isEventActive } from "../events/service";
import { awardActivity, getUserXp } from "./service";

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
): Promise<Result<CheckinData>> {
	if (!userId) {
		return err("UNAUTHORIZED", "Authentication required", {
			reason: "NOT_AUTHENTICATED",
		});
	}

	const eventResult = await getEventById(eventId);

	if (!eventResult.ok) {
		return err("NOT_FOUND", "Event not found", {
			reason: "EVENT_NOT_FOUND",
		});
	}

	const event = eventResult.data;

	if (!isEventActive(event)) {
		return err("CONFLICT", "Event is not active", {
			reason: "EVENT_NOT_ACTIVE",
		});
	}

	if (event.currentQrSecret !== qrCode) {
		return err("VALIDATION_ERROR", "Invalid QR code", {
			reason: "INVALID_CODE",
		});
	}

	if (!event.qrExpiresAt || event.qrExpiresAt <= new Date()) {
		return err("CONFLICT", "QR code expired", {
			reason: "CODE_EXPIRED",
		});
	}

	const awardResult = await awardActivity(
		userId,
		"MEETUP_ATTENDANCE",
		eventId,
		"event",
	);

	if (!awardResult.ok) {
		const reason =
			typeof awardResult.error.details === "object" &&
			awardResult.error.details &&
			"reason" in awardResult.error.details
				? String((awardResult.error.details as { reason?: unknown }).reason)
				: undefined;

		if (reason === "ALREADY_AWARDED") {
			return err("CONFLICT", "Already checked in", {
				reason: "ALREADY_CHECKED_IN",
			});
		}

		return err("INTERNAL_ERROR", "Failed to process check-in", {
			reason: "AWARD_FAILED",
		});
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
): Promise<Result<UserCheckin[]>> {
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