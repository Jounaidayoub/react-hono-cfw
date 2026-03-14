import { z } from "zod";
import { eventFormSchema } from "../../../lib/schemas";
import { createHonoApp } from "../../app";
import { adminMiddleware } from "../../middleware/admin";
import { authMiddleware } from "../../middleware/auth";
import {
	jsonError,
	jsonOk,
} from "../../shared/response";
import {
	createEvent,
	deleteEvent,
	getActiveQrCode,
	getEventAttendees,
	getEventById,
	listEvents,
	updateEvent,
} from "./service";
import { processCheckin } from "../xp/checkin-service";

const events = createHonoApp();

events.post("/", authMiddleware, adminMiddleware, async c => {
	const body = eventFormSchema.safeParse(await c.req.json());

	if (!body.success) {
		return jsonError(c, "VALIDATION_ERROR", body.error.issues);
	}

	const user = c.get("user");
	const result = await createEvent(
		{
			...body.data,
			startsAt: new Date(body.data.startsAt),
			endsAt: new Date(body.data.endsAt),
		},
		user.id,
	);

	return result.ok ? jsonOk(c, result.data, 201) : jsonError(c, result.error.type);
});

events.get("/", authMiddleware, adminMiddleware, async c => {
	const result = await listEvents();
	if (!result.ok) {
		throw new Error("Unexpected error");
	}
	return jsonOk(c, result.data);
});

events.get("/:id", authMiddleware, adminMiddleware, async c => {
	const result = await getEventById(c.req.param("id"));
	return result.ok ? jsonOk(c, result.data) : jsonError(c, result.error.type);
});

events.patch("/:id", authMiddleware, adminMiddleware, async c => {
	const body = eventFormSchema.partial().safeParse(await c.req.json());

	if (!body.success) {
		return jsonError(c, "VALIDATION_ERROR", body.error.issues);
	}

	const { startsAt, endsAt, ...restData } = body.data;
	const result = await updateEvent(c.req.param("id"), {
		...restData,
		...(startsAt ? { startsAt: new Date(startsAt) } : {}),
		...(endsAt ? { endsAt: new Date(endsAt) } : {}),
	});

	return result.ok ? jsonOk(c, result.data) : jsonError(c, result.error.type);
});

events.delete("/:id", authMiddleware, adminMiddleware, async c => {
	const result = await deleteEvent(c.req.param("id"));
	return result.ok ? jsonOk(c, null) : jsonError(c, result.error.type);
});

events.get("/:id/qr", authMiddleware, adminMiddleware, async c => {
	const id = c.req.param("id");
	const requestUrl = new URL(c.req.url);
	const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
	const result = await getActiveQrCode(id, baseUrl);

	return result.ok ? jsonOk(c, result.data) : jsonError(c, result.error.type);
});

events.get("/:id/attendees", authMiddleware, adminMiddleware, async c => {
	const eventResult = await getEventById(c.req.param("id"));

	if (!eventResult.ok) {
		return jsonError(c, eventResult.error.type);
	}

	const result = await getEventAttendees(c.req.param("id"));
	
	if (!result.ok) {
		// result.error.
		
		throw new Error("Unexpected error");
		
	}
	return jsonOk(c, result.data);
});

events.post("/:eventId/checkin", authMiddleware, async c => {
	const body = z.object({ code: z.string() }).safeParse(await c.req.json());

	if (!body.success) {
		return jsonError(c, "VALIDATION_ERROR", body.error.issues);
	}

	const user = c.get("user");
	const result = await processCheckin(
		user.id,
		c.req.param("eventId"),
		body.data.code,
	);

	if (!result.ok) {
		return jsonError(c, result.error.type);
	}

	return jsonOk(c, result.data);
});

export default events;