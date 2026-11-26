import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const metadata: Metadata = {
  title: "Member Dashboard | NACOS UNIUYO",
  description: "Personal portal for NACOS University of Uyo students and members.",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
