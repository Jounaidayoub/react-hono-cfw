import { profileFormSchema } from "../../../lib/schemas";
import { createHonoApp } from "../../app";
import { authMiddleware } from "../../middleware/auth";
import { jsonError, jsonOk } from "../../shared/response";
import { getProfileByUserId, upsertProfile } from "./service";

const profile = createHonoApp();

profile.use("*", authMiddleware);



profile.get("/", async c => {
	const user = c.get("user");
	const result = await getProfileByUserId(user.id);

	if (result.ok) {
		return jsonOk(c, result.data);
	}

	return jsonError(c, result.error.type);
});

profile.post("/", async c => {
	const body = profileFormSchema.safeParse(await c.req.json());

	if (!body.success) {
		return jsonError(c, "VALIDATION_ERROR", body.error.issues);
	}

	const user = c.get("user");
	const result = await upsertProfile(user.id, body.data);

	if (result.ok) {
		return jsonOk(c, result.data, 201);
	}

	return jsonError(c, result.error.type);
});

export default profile;