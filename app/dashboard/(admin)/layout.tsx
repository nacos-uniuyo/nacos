"use client";

import { useRouter } from "nextjs-toploader/app";
import { useEffect } from "react";
import { isSignedOut, useDashboardSession } from "@/lib/auth-client";

export default function DashboardAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, isCoordinator, isPending, error } = useDashboardSession();
  const router = useRouter();

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      if (isSignedOut(error)) {
        router.replace("/login");
      }
      return;
    }
    if (!isCoordinator) {
      router.replace("/dashboard");
    }
  }, [session, isCoordinator, isPending, error, router]);

  return children;
}
