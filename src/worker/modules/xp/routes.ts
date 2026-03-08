import { createHonoApp } from "../../app";
import { authMiddleware } from "../../middleware/auth";
import { jsonOk } from "../../shared/response";
import { getUserCheckins } from "./checkin-service";
import { getUserXp } from "./service";

const xp = createHonoApp();

xp.use("*", authMiddleware);

xp.get("/xp", async c => {
	const user = c.get("user");
	const result = await getUserXp(user.id);

	if (!result.ok) {
		throw new Error("Unexpected XP result error");
	}

	return jsonOk(c, result.data);
});

xp.get("/checkins", async c => {
	const user = c.get("user");
	const result = await getUserCheckins(user.id);

	if (!result.ok) {
		throw new Error("Unexpected checkins result error");
	}

	return jsonOk(c, result.data);
});

export default xp;