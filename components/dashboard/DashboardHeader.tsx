import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface DashboardHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function DashboardHeader({
  breadcrumbs,
  title,
  description,
  action,
}: DashboardHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 border-b border-[var(--rule)] pb-5 md:flex-row md:items-center md:justify-between">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="mb-2 flex items-center gap-1.5 text-xs text-[var(--muted)]"
          >
            <Link
              href="/dashboard"
              className="hover:text-[var(--forest)] hover:underline"
            >
              Dashboard
            </Link>
            {breadcrumbs.map((crumb, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <ChevronRight className="size-3 text-[var(--muted)]/60" />
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-[var(--forest)] hover:underline"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-medium text-[var(--ink)]">
                    {crumb.label}
                  </span>
                )}
              </div>
            ))}
          </nav>
        )}
        <h1 className="serif text-2xl font-bold tracking-tight text-[var(--ink)] sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
