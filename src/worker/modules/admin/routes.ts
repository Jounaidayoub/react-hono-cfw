import { paymentStatusSchema } from "../../../lib/schemas";
import { createHonoApp } from "../../app";
import { adminMiddleware } from "../../middleware/admin";
import { authMiddleware } from "../../middleware/auth";
import {
	jsonErr,
	jsonOk,
	jsonValidationErr,
} from "../../shared/response";
import { getAdminUserProfile, updatePaymentStatus } from "./service";

const admin = createHonoApp();

admin.use("*", authMiddleware, adminMiddleware);

admin.get("/users/:userId/profile", async c => {
	const userId = c.req.param("userId");
	const result = await getAdminUserProfile(userId);

	return result.ok ? jsonOk(c, result.data) : jsonErr(c, result.error);
});

admin.patch("/users/:userId/payment-status", async c => {
	const userId = c.req.param("userId");
	const body = paymentStatusSchema.safeParse(await c.req.json());

	if (!body.success) {
		return jsonValidationErr(c, body.error.issues);
	}

	const result = await updatePaymentStatus(userId, body.data.paymentStatus);

	return result.ok ? jsonOk(c, result.data) : jsonErr(c, result.error);
});

export default admin;