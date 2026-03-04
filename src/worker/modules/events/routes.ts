import { auth } from "../../../lib/auth";
import { eventFormSchema } from "../../../lib/schemas";
import { createHonoApp } from "../../app";
import { adminMiddleware } from "../../middleware/admin";
import { authMiddleware } from "../../middleware/auth";
import { jsonCreated, jsonErr, jsonOk, jsonValidationErr } from "../../shared/response";
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
		return jsonValidationErr(c, body.error.issues);
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

	return result.ok ? jsonCreated(c, result.data) : jsonErr(c, result.error);
});

events.get("/", authMiddleware, adminMiddleware, async c => {
	const result = await listEvents();
	return result.ok ? jsonOk(c, result.data) : jsonErr(c, result.error);
});

events.get("/:id", authMiddleware, adminMiddleware, async c => {
	const result = await getEventById(c.req.param("id"));
	return result.ok ? jsonOk(c, result.data) : jsonErr(c, result.error);
});

events.patch("/:id", authMiddleware, adminMiddleware, async c => {
	const body = eventFormSchema.partial().safeParse(await c.req.json());

	if (!body.success) {
		return jsonValidationErr(c, body.error.issues);
	}

	const { startsAt, endsAt, ...restData } = body.data;
	const result = await updateEvent(c.req.param("id"), {
		...restData,
		...(startsAt ? { startsAt: new Date(startsAt) } : {}),
		...(endsAt ? { endsAt: new Date(endsAt) } : {}),
	});

	return result.ok ? jsonOk(c, result.data) : jsonErr(c, result.error);
});

events.delete("/:id", authMiddleware, adminMiddleware, async c => {
	const result = await deleteEvent(c.req.param("id"));
	return result.ok ? jsonOk(c, null) : jsonErr(c, result.error);
});

events.get("/:id/qr", authMiddleware, adminMiddleware, async c => {
	const id = c.req.param("id");
	const requestUrl = new URL(c.req.url);
	const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
	const result = await getActiveQrCode(id, baseUrl);

	return result.ok ? jsonOk(c, result.data) : jsonErr(c, result.error);
});

events.get("/:id/attendees", authMiddleware, adminMiddleware, async c => {
	const eventResult = await getEventById(c.req.param("id"));

	if (!eventResult.ok) {
		return jsonErr(c, eventResult.error);
	}

	const result = await getEventAttendees(c.req.param("id"));
	return result.ok ? jsonOk(c, result.data) : jsonErr(c, result.error);
});

events.get("/:eventId/checkin", async c => {
	const eventId = c.req.param("eventId");
	const code = c.req.query("code");

	if (!code) {
		return c.redirect("/checkin/error?error=INVALID_CODE");
	}

	const session = await auth.api.getSession({ headers: c.req.raw.headers });
	const userId = session?.user?.id ?? null;

	if (!userId) {
		const loginUrl = new URL("/login", c.req.url);
		loginUrl.searchParams.set("returnTo", c.req.url);
		return c.redirect(loginUrl.toString());
	}

	const result = await processCheckin(userId, eventId, code);

	if (!result.ok) {
		const details = result.error.details as { reason?: string } | undefined;
		const reason = details?.reason ?? result.error.code;
		const errorUrl = new URL("/checkin/error", c.req.url);
		errorUrl.searchParams.set("error", reason);
		return c.redirect(errorUrl.toString());
	}

	const successUrl = new URL("/checkin/success", c.req.url);
	successUrl.searchParams.set("xp", result.data.xpAwarded.toString());
	successUrl.searchParams.set("event", result.data.eventName);
	successUrl.searchParams.set("total", result.data.totalXp.toString());
	return c.redirect(successUrl.toString());
});

export default events;