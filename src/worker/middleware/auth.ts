import { createMiddleware } from "hono/factory";
import { auth } from "../../lib/auth";
import { BaseEnv } from "../app";

type User = typeof auth.$Infer.Session.user;
type Session = typeof auth.$Infer.Session.session;

/** Session variables for authenticated context */
export type SessionVariables = { user: User; session: Session };

/** Auth middleware - validates session and sets user/session in context. Returns 401 if unauthorized. */
export const authMiddleware = createMiddleware<BaseEnv>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("user", session.user);
  c.set("session", session.session);

  await next();
});
