import { activityTypeUpdateSchema } from "../../../lib/schemas";
import { createHonoApp } from "../../app";
import { adminMiddleware } from "../../middleware/admin";
import { authMiddleware } from "../../middleware/auth";
import {
	jsonErr,
	jsonOk,
	jsonValidationErr,
} from "../../shared/response";
import {
	getActivityTypeById,
	listActivityTypes,
	updateActivityType,
} from "./service";

const activityTypes = createHonoApp();

activityTypes.use("*", authMiddleware, adminMiddleware);

activityTypes.get("/", async c => {
	const result = await listActivityTypes();
	return result.ok ? jsonOk(c, result.data) : jsonErr(c, result.error);
});

activityTypes.get("/:id", async c => {
	const result = await getActivityTypeById(c.req.param("id"));
	return result.ok ? jsonOk(c, result.data) : jsonErr(c, result.error);
});

activityTypes.patch("/:id", async c => {
	const body = activityTypeUpdateSchema.safeParse(await c.req.json());

	if (!body.success) {
		return jsonValidationErr(c, body.error.issues);
	}

	const result = await updateActivityType(c.req.param("id"), body.data);
	return result.ok ? jsonOk(c, result.data) : jsonErr(c, result.error);
});

export default activityTypes;