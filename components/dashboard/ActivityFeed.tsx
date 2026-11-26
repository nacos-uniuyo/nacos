import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { EmptyState } from "@/components/dashboard/DashboardStates";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import type { OpportunityStatus } from "@/lib/enums";
import { cn } from "@/lib/utils";

export interface ActivityFeedItem {
  id: string;
  title: string;
  meta: string;
  date: string;
  icon: LucideIcon;
  tone: "emerald" | "amber" | "sky" | "rose" | "neutral";
  status?: OpportunityStatus;
  href?: string;
  actionLabel?: string;
}

const iconToneStyles: Record<ActivityFeedItem["tone"], string> = {
  emerald: "bg-emerald-500/12 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  amber: "bg-amber-500/12 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
  sky: "bg-sky-500/12 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400",
  rose: "bg-rose-500/12 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400",
  neutral: "bg-muted text-muted-foreground",
};

export function ActivityFeed({
  title,
  seeAllHref,
  items,
  loading = false,
  emptyTitle = "No activity yet",
  emptyAction,
  onItemIntent,
}: {
  title: string;
  seeAllHref?: string;
  items: ActivityFeedItem[];
  loading?: boolean;
  emptyTitle?: string;
  emptyAction?: React.ReactNode;
  onItemIntent?: (item: ActivityFeedItem) => void;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-2xs sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {seeAllHref && items.length > 0 ? (
          <Link
            href={seeAllHref}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            See all
            <ArrowRight className="size-3" />
          </Link>
        ) : null}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-3 py-1">
              <div className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-xl" />
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-3.5 w-44" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState title={emptyTitle} action={emptyAction} bordered={false} />
      ) : (
        <ul className="divide-y">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <li
                key={item.id}
                className="flex flex-col justify-between gap-2.5 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-xl",
                      iconToneStyles[item.tone],
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.meta}</p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3 self-end sm:self-auto">
                  <span className="text-[11px] text-muted-foreground">{item.date}</span>
                  {item.status ? <StatusBadge status={item.status} /> : null}
                  {item.href && item.actionLabel ? (
                    <Link
                      href={item.href}
                      className="text-xs font-medium text-primary hover:underline"
                      onMouseEnter={() => onItemIntent?.(item)}
                      onFocus={() => onItemIntent?.(item)}
                    >
                      {item.actionLabel}
                    </Link>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
