import { activityTypeUpdateSchema } from "../../../lib/schemas";
import { createHonoApp } from "../../app";
import { adminMiddleware } from "../../middleware/admin";
import { authMiddleware } from "../../middleware/auth";
import { jsonError, jsonOk } from "../../shared/response";
import {
	getActivityTypeById,
	listActivityTypes,
	updateActivityType,
} from "./service";

const activityTypes = createHonoApp();

activityTypes.use("*", authMiddleware, adminMiddleware);

activityTypes.get("/", async c => {
	const result = await listActivityTypes();
	if (!result.ok) {
		throw new Error("Unexpected error");
	}
	return jsonOk(c, result.data);
});

activityTypes.get("/:id", async c => {
	const result = await getActivityTypeById(c.req.param("id"));
	if (result.ok) {
		return jsonOk(c, result.data);
	}

	return jsonError(c, result.error.type);
});

activityTypes.patch("/:id", async c => {
	const body = activityTypeUpdateSchema.safeParse(await c.req.json());

	if (!body.success) {
		return jsonError(c, "VALIDATION_ERROR", body.error.issues);
	}

	const result = await updateActivityType(c.req.param("id"), body.data);
	if (result.ok) {
		return jsonOk(c, result.data);
	}

	return jsonError(c, result.error.type);
});

export default activityTypes;