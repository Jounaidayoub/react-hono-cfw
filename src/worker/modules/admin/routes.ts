import { paymentStatusSchema } from "../../../lib/schemas";
import { createHonoApp } from "../../app";
import { adminMiddleware } from "../../middleware/admin";
import { authMiddleware } from "../../middleware/auth";
import { jsonError, jsonOk } from "../../shared/response";
import { getAdminUserProfile, updatePaymentStatus } from "./service";

const admin = createHonoApp();

admin.use("*", authMiddleware, adminMiddleware);

admin.get("/users/:userId/profile", async c => {
	const userId = c.req.param("userId");
	const result = await getAdminUserProfile(userId);

	if (result.ok) {
		return jsonOk(c, result.data);
	}

	return jsonError(c, result.error.type);
});

admin.patch("/users/:userId/payment-status", async c => {
	const userId = c.req.param("userId");
	const body = paymentStatusSchema.safeParse(await c.req.json());

	if (!body.success) {
		return jsonError(c, "VALIDATION_ERROR", body.error.issues);
	}

	const result = await updatePaymentStatus(userId, body.data.paymentStatus);

	if (result.ok) {
		return jsonOk(c, result.data);
	}

	return jsonError(c, result.error.type);
});

export default admin;