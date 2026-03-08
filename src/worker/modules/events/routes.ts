import { auth } from "../../../lib/auth";
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

events.get("/:eventId/checkin", async c => {
	const eventId = c.req.param("eventId");
	const code = c.req.query("code");

	if (!code) {
		// use jsonerror? 
		return c.redirect("/checkin/error?error=XP_INVALID_CODE");
	}

	const session = await auth.api.getSession({ headers: c.req.raw.headers });
	const userId = session?.user?.id ?? null;
	// this wil be obselette once we move the qrcode code too hit a screen isntead of hitting tis endpoint directly, 
	// using our middlware as ustaul and leting the cilent handle the redirection to login if needed.
	if (!userId) {
		const loginUrl = new URL("/login", c.req.url);
		loginUrl.searchParams.set("returnTo", c.req.url);
		return c.redirect(loginUrl.toString());
	}

	const result = await processCheckin(userId, eventId, code);

	if (!result.ok) {
		
		const errorUrl = new URL("/checkin/error", c.req.url);
		errorUrl.searchParams.set("error", result.error.type);
		return c.redirect(errorUrl.toString());
	}

	const successUrl = new URL("/checkin/success", c.req.url);
	successUrl.searchParams.set("xp", result.data.xpAwarded.toString());
	successUrl.searchParams.set("event", result.data.eventName);
	successUrl.searchParams.set("total", result.data.totalXp.toString());
	return c.redirect(successUrl.toString());
});

export default events;