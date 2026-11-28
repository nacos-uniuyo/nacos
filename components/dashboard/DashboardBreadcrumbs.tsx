"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const SEGMENT_LABELS: Record<string, string> = {
  projects: "Projects",
  opportunities: "Opportunities",
  saved: "Saved",
  submit: "Submit",
  profile: "Account",
  departments: "Coordinator",
  roster: "Roster",
  notices: "Notices",
  new: "New Notice",
  admin: "Control Center",
  "deans-message": "Dean's message",
};

const root = { href: "/dashboard", label: "Dashboard" };

export function DashboardBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.slice(root.href.length).split("/").filter(Boolean);

  if (segments.length === 0) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{root.label}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={root.href}>{root.label}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {segments.map((segment, index) => {
          const href = `${root.href}/${segments.slice(0, index + 1).join("/")}`;
          const label = SEGMENT_LABELS[segment] ?? segment;
          const isLast = index === segments.length - 1;

          return (
            <Fragment key={href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
