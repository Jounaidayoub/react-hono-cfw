import { and, eq, gte, lte } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../../../lib/db";
import {
	events,
	user,
	userActivities,
	type Event,
	type EventInsert,
	type EventUpdate,
} from "../../../lib/schemas";
import { err, ok, type Result } from "../../../lib/types";

export type QrCodeData = {
	qrContent: string;
	expiresAt: Date;
	ttlSeconds: number;
	rotationSeconds: number;
};

export type EventAttendee = {
	userId: string;
	userName: string | null;
	userEmail: string;
	checkedInAt: Date;
	xpAwarded: number;
};

export async function createEvent(
	data: Omit<EventInsert, "id" | "createdAt" | "updatedAt" | "createdBy">,
	createdBy: string,
): Promise<Result<Event>> {
	const id = nanoid();

	await db.insert(events).values({
		id,
		...data,
		createdBy,
	});

	const created = await db.select().from(events).where(eq(events.id, id)).get();

	if (!created) {
		return err("INTERNAL_ERROR", "Failed to create event");
	}

	return ok(created);
}

export async function getEventById(eventId: string): Promise<Result<Event>> {
	const event = await db
		.select()
		.from(events)
		.where(eq(events.id, eventId))
		.get();

	if (!event) {
		return err("NOT_FOUND", "Event not found");
	}

	return ok(event);
}

export async function listEvents(): Promise<Result<Event[]>> {
	const data = await db.select().from(events).orderBy(events.startsAt).all();
	return ok(data);
}

export async function listActiveEvents(): Promise<Result<Event[]>> {
	const now = new Date();
	const data = await db
		.select()
		.from(events)
		.where(and(lte(events.startsAt, now), gte(events.endsAt, now)))
		.all();

	return ok(data);
}

export async function updateEvent(
	eventId: string,
	data: EventUpdate,
): Promise<Result<Event>> {
	const existing = await getEventById(eventId);

	if (!existing.ok) {
		return existing;
	}

	const [updated] = await db
		.update(events)
		.set({
			...data,
			updatedAt: new Date(),
		})
		.where(eq(events.id, eventId))
		.returning();

	if (!updated) {
		return err("INTERNAL_ERROR", "Failed to update event");
	}

	return ok(updated);
}

export async function deleteEvent(eventId: string): Promise<Result<void>> {
	const existing = await getEventById(eventId);

	if (!existing.ok) {
		return existing;
	}

	await db.delete(events).where(eq(events.id, eventId));
	return ok(undefined);
}

export function isEventActive(event: Event): boolean {
	const now = new Date();
	return event.startsAt <= now && event.endsAt >= now;
}

export function generateQrSecret(eventId: string): string {
	const timestamp = Date.now();
	const random = nanoid(8);
	return `evt_${eventId}_${timestamp}_${random}`;
}

function buildCheckinUrl(baseUrl: string, eventId: string, secret: string): string {
	const url = new URL(`/api/events/${eventId}/checkin`, baseUrl);
	url.searchParams.set("code", secret);
	return url.toString();
}

export async function getActiveQrCode(
	eventId: string,
	baseUrl: string,
): Promise<Result<QrCodeData>> {
	const eventResult = await getEventById(eventId);

	if (!eventResult.ok) {
		return eventResult;
	}

	const event = eventResult.data;
	const now = new Date();

	if (event.currentQrSecret && event.qrExpiresAt && event.qrExpiresAt > now) {
		const ttlSeconds = Math.floor(
			(event.qrExpiresAt.getTime() - now.getTime()) / 1000,
		);

		return ok({
			qrContent: buildCheckinUrl(baseUrl, eventId, event.currentQrSecret),
			expiresAt: event.qrExpiresAt,
			ttlSeconds,
			rotationSeconds: event.qrRotationSeconds,
		});
	}

	const newSecret = generateQrSecret(eventId);
	const expiresAt = new Date(now.getTime() + event.qrRotationSeconds * 1000);

	await db
		.update(events)
		.set({
			currentQrSecret: newSecret,
			qrExpiresAt: expiresAt,
			updatedAt: now,
		})
		.where(eq(events.id, eventId));

	return ok({
		qrContent: buildCheckinUrl(baseUrl, eventId, newSecret),
		expiresAt,
		ttlSeconds: event.qrRotationSeconds,
		rotationSeconds: event.qrRotationSeconds,
	});
}

export async function getEventAttendees(
	eventId: string,
): Promise<Result<EventAttendee[]>> {
	const attendees = await db
		.select({
			userId: userActivities.userId,
			userName: user.name,
			userEmail: user.email,
			checkedInAt: userActivities.createdAt,
			xpAwarded: userActivities.xpAwarded,
		})
		.from(userActivities)
		.innerJoin(user, eq(userActivities.userId, user.id))
		.where(
			and(
				eq(userActivities.referenceId, eventId),
				eq(userActivities.referenceType, "event"),
			),
		)
		.all();

	return ok(attendees);
}