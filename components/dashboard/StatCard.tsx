import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type StatTone = "emerald" | "amber" | "sky" | "violet" | "rose";

const toneStyles: Record<StatTone, { bg: string; icon: string }> = {
  emerald: {
    bg: "bg-emerald-500/12 dark:bg-emerald-500/15",
    icon: "text-emerald-600 dark:text-emerald-400",
  },
  amber: {
    bg: "bg-amber-500/12 dark:bg-amber-500/15",
    icon: "text-amber-600 dark:text-amber-300",
  },
  sky: {
    bg: "bg-sky-500/12 dark:bg-sky-500/15",
    icon: "text-sky-600 dark:text-sky-400",
  },
  violet: {
    bg: "bg-violet-500/12 dark:bg-violet-500/15",
    icon: "text-violet-600 dark:text-violet-400",
  },
  rose: {
    bg: "bg-rose-500/12 dark:bg-rose-500/15",
    icon: "text-rose-600 dark:text-rose-400",
  },
};

export interface StatCardProps {
  label: string;
  value: number | string | undefined;
  icon: LucideIcon;
  tone?: StatTone;
  pill?: string;
  loading?: boolean;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "emerald",
  pill,
  loading = false,
}: StatCardProps) {
  const styles = toneStyles[tone];

  return (
    <div className="flex flex-col justify-between gap-4 rounded-2xl border bg-card p-5 shadow-2xs transition-colors hover:border-primary/25">
      <div className="flex items-start justify-between gap-3">
        <div className={cn("flex size-10 items-center justify-center rounded-xl", styles.bg)}>
          <Icon className={cn("size-5", styles.icon)} />
        </div>
        {pill ? (
          <span className="rounded-full border bg-muted/60 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
            {pill}
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {loading ? (
          <Skeleton className="mt-1 h-8 w-14" />
        ) : (
          <p className="text-2xl font-semibold tracking-tight tabular-nums text-foreground sm:text-3xl">
            {typeof value === "number" ? value.toLocaleString() : (value ?? 0)}
          </p>
        )}
      </div>
    </div>
  );
}
