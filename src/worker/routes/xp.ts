import { createHonoApp } from "../app";
import { authMiddleware } from "../middleware/auth";
import { getUserXp } from "../services/xp-service";
import { getUserCheckins } from "../services/checkin-service";

const app = createHonoApp();


app.use("*", authMiddleware);

/**
 * GET /api/my/xp - Get current user's total XP
 */
app.get("/xp", async (c) => {
  const user = c.get("user");
  const totalXp = await getUserXp(user.id);
  return c.json({ totalXp });
});

/**
 * GET /api/my/checkins - Get user's check-in history
 */
app.get("/checkins", async (c) => {
  const user = c.get("user");
  const checkins = await getUserCheckins(user.id);
  return c.json(checkins);
});

export default app;
