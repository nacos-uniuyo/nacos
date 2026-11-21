import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CoordinatorNav } from "@/components/coordinator/CoordinatorNav";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Department Coordinator Console | NACOS UNIUYO",
  description: "Department management and project review console for NACOS coordinators.",
  robots: { index: false, follow: false },
};

export default async function CoordinatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  const role = session.user.role ?? "user";

  if (role !== "department_editor" && role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[var(--paper)]">
      <div className="mx-auto flex max-w-[1400px] flex-col lg:flex-row">
        <CoordinatorNav
          user={{
            name: session.user.name,
            email: session.user.email,
            role,
          }}
          departmentSlug={(session.user as { departmentSlug?: string | null }).departmentSlug ?? null}
        />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
