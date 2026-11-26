import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function DashboardAdminLayout({
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

  return children;
}
