import { createAuthClient } from "better-auth/react";

/**
 * Browser auth client. It talks to /api/auth on the current origin, so there is
 * no base URL to keep in sync between localhost and Vercel.
 */
export const authClient = createAuthClient();
