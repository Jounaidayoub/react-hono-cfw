import { createHonoApp } from "../../app";
import { authMiddleware } from "../../middleware/auth";
import { jsonErr, jsonOk } from "../../shared/response";
import { getUserCheckins } from "./checkin-service";
import { getUserXp } from "./service";

const xp = createHonoApp();

xp.use("*", authMiddleware);

xp.get("/xp", async c => {
	const user = c.get("user");
	const result = await getUserXp(user.id);

	return result.ok ? jsonOk(c, result.data) : jsonErr(c, result.error);
});

xp.get("/checkins", async c => {
	const user = c.get("user");
	const result = await getUserCheckins(user.id);

	return result.ok ? jsonOk(c, result.data) : jsonErr(c, result.error);
});

export default xp;