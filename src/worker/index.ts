import { auth } from "../lib/auth";
import { createHonoApp } from "./app";
import { globalErrorHandler } from "./shared/error-handler";
import profileRouter from "./modules/profile/routes";
import eventsRouter from "./modules/events/routes";
import xpRouter from "./modules/xp/routes";
import activityTypesRouter from "./modules/activity-types/routes";
import adminRouter from "./modules/admin/routes";

const app = createHonoApp();
app.onError(globalErrorHandler);

app.on(["POST", "GET"], "/api/auth/*", (c) => {
	console.log("Auth route hit");
	return auth.handler(c.req.raw);
});

app.route("/api/profile", profileRouter);

app.route("/api/events", eventsRouter);

app.route("/api/my", xpRouter);

app.route("/api/activity-types", activityTypesRouter);

app.route("/api/admin", adminRouter);

export default app;
