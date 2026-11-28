"use client";

import { useRouter } from "nextjs-toploader/app";
import { useEffect } from "react";
import { ErrorState, ListSkeleton } from "@/components/dashboard/DashboardStates";
import { isSignedOut, useDashboardSession } from "@/lib/auth-client";

/**
 * The Faculty Administrator Control Center is for admins only. Department editors are sent to
 * their coordinator console and members to their dashboard, and nothing renders until the
 * session confirms the admin role.
 */
export default function FacultyAdminLayout({ children }: { children: React.ReactNode }) {
  const { session, isAdmin, isCoordinator, isPending, error } = useDashboardSession();
  const router = useRouter();

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      if (isSignedOut(error)) {
        router.replace("/login");
      }
      return;
    }
    if (!isAdmin) {
      router.replace(isCoordinator ? "/dashboard/departments" : "/dashboard");
    }
  }, [session, isAdmin, isCoordinator, isPending, error, router]);

  if (isPending) return <ListSkeleton count={2} />;
  if (!session && !isSignedOut(error)) {
    return (
      <ErrorState
        title="Could not check your access"
        message="The session could not be loaded. Refresh the page to try again."
      />
    );
  }
  if (!isAdmin) return null;
  return children;
}
