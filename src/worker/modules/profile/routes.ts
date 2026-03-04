import { profileFormSchema } from "../../../lib/schemas";
import { createHonoApp } from "../../app";
import { authMiddleware } from "../../middleware/auth";
import {
	jsonCreated,
	jsonErr,
	jsonOk,
	jsonValidationErr,
} from "../../shared/response";
import { getProfileByUserId, upsertProfile } from "./service";

const profile = createHonoApp();

profile.use("*", authMiddleware);



profile.get("/", async c => {
	const user = c.get("user");
	const result = await getProfileByUserId(user.id);

	return result.ok ? jsonOk(c, result.data) : jsonErr(c, result.error);
});

profile.post("/", async c => {
	const body = profileFormSchema.safeParse(await c.req.json());

	if (!body.success) {
		return jsonValidationErr(c, body.error.issues);
	}

	const user = c.get("user");
	const result = await upsertProfile(user.id, body.data);

	return result.ok ? jsonCreated(c, result.data) : jsonErr(c, result.error);
});

export default profile;