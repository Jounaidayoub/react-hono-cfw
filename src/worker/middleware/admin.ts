import { createMiddleware } from "hono/factory";
import type { BaseEnv } from "../app";

/** Admin middleware - requires admin role. Must be used after authMiddleware. Returns 403 if not admin. */
export const adminMiddleware = createMiddleware<BaseEnv>(async (c, next) => {
  const user = c.get("user");

  if (user.role !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  await next();
});
