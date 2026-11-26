"use client";

import { useRouter } from "nextjs-toploader/app";
import { useEffect } from "react";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { isSignedOut, useDashboardSession } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc/client";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { session, isPending, error } = useDashboardSession();
  const router = useRouter();
  const utils = trpc.useUtils();

  useEffect(() => {
    if (isPending) return;
    if (!session && isSignedOut(error)) {
      router.replace("/login");
    }
  }, [session, isPending, error, router]);

  useEffect(() => {
    if (isPending || !session) return;

    const warmCache = () => {
      void utils.user.getProfile.prefetch();
      void utils.department.list.prefetch();
      void utils.session.list.prefetch();
    };

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(warmCache, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }

    const timer = window.setTimeout(warmCache, 200);
    return () => window.clearTimeout(timer);
  }, [isPending, session, utils]);

  return (
    <SidebarProvider data-dashboard="">
      <DashboardSidebar />
      <SidebarInset>
        <DashboardNavbar />
        <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </main>
      </SidebarInset>
      <Toaster richColors position="top-right" />
    </SidebarProvider>
  );
}
