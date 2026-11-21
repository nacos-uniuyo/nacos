import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
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
    <div className="min-h-[calc(100vh-80px)] bg-[var(--paper)]">
      <div className="mx-auto flex max-w-[1400px] flex-col lg:flex-row">
        <DashboardNav
          user={{
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
            role: session.user.role ?? "user",
          }}
        />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
