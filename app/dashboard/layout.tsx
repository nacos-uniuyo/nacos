import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Member Dashboard | NACOS UNIUYO",
  description: "Personal portal for NACOS University of Uyo students and members.",
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <DashboardSidebar
        user={{
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
          role: session.user.role ?? "user",
        }}
      />
      <SidebarInset className="bg-[var(--paper)]">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-[var(--rule)] px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 sm:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 text-[var(--forest)] hover:bg-[var(--sand)]" />
            <Separator orientation="vertical" className="mr-2 h-4 bg-[var(--rule)]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--forest)]">
              Dashboard
            </span>
          </div>
        </header>
        <main id="main" className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 max-w-[1400px]">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
