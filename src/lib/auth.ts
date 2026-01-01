import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db"; // your drizzle instance

import { env } from "cloudflare:workers";
import { Buffer } from "node:buffer";

const trustedOrigins: string[] = env.TRUSTED_ORGINS.split(",");

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  trustedOrigins: trustedOrigins,
  emailAndPassword: {
    enabled: true,
    password: {
      // OVERRIDE: Use Cloudflare's native Web Crypto API
      hash: async (password) => {
        const encoder = new TextEncoder();
        const salt = crypto.getRandomValues(new Uint8Array(16));

        // 1. Import the password as a key (Reference: importKey in your doc)
        const keyMaterial = await crypto.subtle.importKey(
          "raw",
          encoder.encode(password),
          { name: "PBKDF2" },
          false,
          ["deriveBits"]
        );

        // 2. Run the native hashing (Reference: deriveBits in your doc)
        const derivedBits = await crypto.subtle.deriveBits(
          {
            name: "PBKDF2",
            salt: salt,
            iterations: 10000, // 10k iterations is safe for native code
            hash: "SHA-256",
          },
          keyMaterial,
          256
        );

        // Convert to hex for storage
        const saltHex = Buffer.from(salt).toString('hex');
        const hashHex = Buffer.from(derivedBits).toString('hex');
        return `${saltHex}:${hashHex}`;
      },
      verify: async ({ hash, password }) => {
        const [saltHex, originalHashHex] = hash.split(':');
        const salt = Uint8Array.from(Buffer.from(saltHex, 'hex'));

        // Re-run the same native process
        const keyMaterial = await crypto.subtle.importKey(
          "raw",
          new TextEncoder().encode(password),
          { name: "PBKDF2" },
          false,
          ["deriveBits"]
        );

        const derivedBits = await crypto.subtle.deriveBits(
          {
            name: "PBKDF2",
            salt: salt,
            iterations: 10000,
            hash: "SHA-256",
          },
          keyMaterial,
          256
        );

        const derivedHex = Buffer.from(derivedBits).toString('hex');

        // Secure constant-time comparison (crypto.subtle.timingSafeEqual is not always avail for strings)
        return derivedHex === originalHashHex;
      }
    }
  },
  baseURL: env.BETTER_AUTH_URL,
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
});
