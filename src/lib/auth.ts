import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db"; // your drizzle instance
import { scryptSync } from "node:crypto";

import { env } from "cloudflare:workers";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
    /// HACK : this just a workaround for now from 
    // https://github.com/better-auth/better-auth/issues/969
    // 
    password: {
      hash: async (password) => {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');

        const key = scryptSync(
          password.normalize("NFKC"),
          saltHex,
          64,
          {
            N: 16384,
            r: 16,
            p: 1,
            maxmem: 128 * 16384 * 16 * 2
          }
        );

        const keyHex = Array.from(key).map(b => b.toString(16).padStart(2, '0')).join('');
        return `${saltHex}:${keyHex}`;
      },
      verify: async ({ hash, password }) => {
        const [saltHex, keyHex] = hash.split(":");

        const targetKey = scryptSync(
          password.normalize("NFKC"),
          saltHex,
          64,
          {
            N: 16384,
            r: 16,
            p: 1,
            maxmem: 128 * 16384 * 16 * 2
          }
        );

        const targetKeyHex = Array.from(targetKey).map(b => b.toString(16).padStart(2, '0')).join('');
        return targetKeyHex === keyHex;
      },
    },
  },
  baseURL: env.BETTER_AUTH_URL,
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
});
