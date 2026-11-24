import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Clock, FileEdit } from "lucide-react";

interface StatusBadgeProps {
  status: "draft" | "submitted" | "approved" | "rejected";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  switch (status) {
    case "approved":
      return (
        <Badge
          variant="outline"
          className={`border-emerald-600/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 gap-1.5 font-medium ${className ?? ""}`}
        >
          <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
          Approved
        </Badge>
      );
    case "submitted":
      return (
        <Badge
          variant="outline"
          className={`border-amber-600/30 bg-amber-500/10 text-amber-900 dark:text-amber-300 gap-1.5 font-medium ${className ?? ""}`}
        >
          <Clock className="size-3 text-amber-600 dark:text-amber-400" />
          Under Review
        </Badge>
      );
    case "rejected":
      return (
        <Badge
          variant="destructive"
          className={`gap-1.5 font-medium ${className ?? ""}`}
        >
          <AlertCircle className="size-3" />
          Changes Requested
        </Badge>
      );
    case "draft":
    default:
      return (
        <Badge
          variant="secondary"
          className={`border-[var(--rule)] bg-[var(--sand)]/50 text-[var(--muted)] gap-1.5 font-medium ${className ?? ""}`}
        >
          <FileEdit className="size-3" />
          Draft
        </Badge>
      );
  }
}
