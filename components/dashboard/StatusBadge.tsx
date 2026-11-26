import { AlertCircle, CheckCircle2, Clock, FileEdit } from "lucide-react";
import type { OpportunityStatus } from "@/lib/enums";
import { cn } from "@/lib/utils";

const statusConfig = {
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    classes:
      "bg-emerald-500/12 text-emerald-700 border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/25",
  },
  submitted: {
    label: "In Review",
    icon: Clock,
    classes:
      "bg-amber-500/12 text-amber-700 border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/25",
  },
  rejected: {
    label: "Changes",
    icon: AlertCircle,
    classes:
      "bg-rose-500/12 text-rose-700 border-rose-500/20 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/25",
  },
  draft: {
    label: "Draft",
    icon: FileEdit,
    classes: "bg-muted text-muted-foreground border-border",
  },
} as const satisfies Record<OpportunityStatus, object>;

export function StatusBadge({
  status,
  className,
}: {
  status: OpportunityStatus;
  className?: string;
}) {
  const { label, icon: Icon, classes } = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap",
        classes,
        className,
      )}
    >
      <Icon className="size-3" />
      {label}
    </span>
  );
}
