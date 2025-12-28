import { drizzle } from "drizzle-orm/d1";
import { env } from "cloudflare:workers";
import * as schema from "./schemas";

export const db = drizzle(env.d1_cfw, {  schema });
