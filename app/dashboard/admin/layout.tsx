"use client";

import { useRouter } from "nextjs-toploader/app";
import { useEffect } from "react";
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

  if (!isAdmin) return null;
  return children;
}
