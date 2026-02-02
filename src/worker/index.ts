import { auth } from "../lib/auth";
import { createHonoApp } from "./app";
import profileRouter from "./routes/profile";
import eventsRouter from "./routes/events";
import xpRouter from "./routes/xp";
import activityTypesRouter from "./routes/activity-types";

const app = createHonoApp();

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  console.log("Auth route hit");
  return auth.handler(c.req.raw);
});


app.route("/api/profile", profileRouter);

app.route("/api/events", eventsRouter);

app.route("/api/my", xpRouter);

app.route("/api/activity-types", activityTypesRouter);

export default app;
