import { AlertCircle, CheckCircle2, Clock, FileEdit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { OpportunityStatus } from "@/lib/enums";

const statusConfig = {
  approved: { label: "Approved", variant: "default", icon: CheckCircle2 },
  submitted: { label: "Under Review", variant: "secondary", icon: Clock },
  rejected: { label: "Changes Requested", variant: "destructive", icon: AlertCircle },
  draft: { label: "Draft", variant: "outline", icon: FileEdit },
} as const satisfies Record<OpportunityStatus, object>;

export function StatusBadge({ status }: { status: OpportunityStatus }) {
  const { label, variant, icon: Icon } = statusConfig[status];

  return (
    <Badge variant={variant}>
      <Icon />
      {label}
    </Badge>
  );
}
