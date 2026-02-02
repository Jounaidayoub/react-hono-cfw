import { Hono } from "hono";
import type { SessionVariables } from "./middleware/auth";

/** Base environment with Cloudflare bindings and session context */
export type BaseEnv = { Bindings: Env; Variables: SessionVariables };

/** Factory to create a typed Hono app instance */
export function createHonoApp<E extends BaseEnv = BaseEnv>(): Hono<E> {
  return new Hono<E>();
}
