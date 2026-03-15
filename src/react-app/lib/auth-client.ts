import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { auth } from "../../lib/auth";

export const authClient = createAuthClient({
    plugins: [
        adminClient(),
        inferAdditionalFields<typeof auth>()
    ],
});
