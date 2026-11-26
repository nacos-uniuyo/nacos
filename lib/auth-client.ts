import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "@/lib/auth";
import { roleNames, type RoleName } from "@/lib/enums";

/**
 * Browser auth client. It talks to /api/auth on the current origin, so there is
 * no base URL to keep in sync between localhost and Vercel.
 */
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
  sessionOptions: {
    refetchOnWindowFocus: false,
  },
});

/**
 * A missing session only means "signed out" when the server explicitly returned 401
 * or there was no transient network/5xx error.
 */
export function isSignedOut(error: { status?: number } | null | undefined): boolean {
  return !error || error.status === 401;
}

export function useDashboardSession() {
  const { data: session, isPending, error } = authClient.useSession();
  const user = session?.user ?? null;
  const role: RoleName = roleNames.find((candidate) => candidate === user?.role) ?? "user";
  const isAuthenticated = Boolean(user);
  const isAdmin = isAuthenticated && role === "admin";
  const isCoordinator = isAuthenticated && (role === "department_editor" || role === "admin");

  return {
    session,
    user,
    role,
    isAuthenticated,
    isAdmin,
    isCoordinator,
    isPending,
    error,
  };
}
