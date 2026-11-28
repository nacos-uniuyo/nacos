"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Loader2,
  MessageSquare,
  User,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ErrorState, ListSkeleton } from "@/components/dashboard/DashboardStates";
import { ReasonDialog } from "@/components/dashboard/ReasonDialog";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { RichTextRenderer } from "@/components/RichTextRenderer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, opportunityTypeLabels } from "@/lib/format";
import { trpc } from "@/lib/trpc/client";
import { isHttpUrl } from "@/lib/utils";

const QUEUE_HREF = "/dashboard/departments/opportunities";

export default function CoordinatorOpportunityDetailPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : (params.slug?.[0] ?? "");
  const utils = trpc.useUtils();
  const { data: opp, isLoading, error } = trpc.coordinator.getOpportunity.useQuery({ slug });

  const [confirmApprove, setConfirmApprove] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const reviewMutation = trpc.coordinator.reviewOpportunity.useMutation({
    onSuccess: async (updated) => {
      await utils.coordinator.listOpportunities.invalidate();
      await utils.coordinator.getOpportunity.invalidate({ slug });
      await utils.coordinator.getDepartmentOverview.invalidate();
      toast.success(
        updated.status === "approved" ? "Opportunity approved." : "Feedback sent to member.",
      );
      setConfirmApprove(false);
      setRejectOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return <ListSkeleton count={3} />;
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <ErrorState title="Could not load opportunity" message={error.message} />
        <Button variant="outline" size="sm" asChild className="w-fit rounded-xl text-xs">
          <Link href={QUEUE_HREF}>
            <ArrowLeft className="size-3.5" />
            Opportunity Review
          </Link>
        </Button>
      </div>
    );
  }

  if (!opp) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href={QUEUE_HREF}
          className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Opportunity Review
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={opp.status} />
          <Badge variant="secondary" className="rounded-full text-[11px]">
            {opportunityTypeLabels[opp.type]}
          </Badge>
          <Badge variant="outline" className="rounded-full text-[11px]">
            {opp.departmentName ?? "Faculty-wide"}
          </Badge>
        </div>

        <DashboardHeader title={opp.title} description={opp.orgName} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <Card className="rounded-2xl shadow-2xs">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Description</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-foreground">
              <RichTextRenderer doc={opp.descriptionJson} />
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-2xs">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-muted-foreground">Location</dt>
                  <dd className="mt-0.5 font-medium">{opp.location}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Deadline</dt>
                  <dd className="mt-0.5 font-medium">
                    {opp.deadline ? formatDate(opp.deadline) : "Rolling"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Submitted</dt>
                  <dd className="mt-0.5 font-medium">{formatDate(opp.createdAt)}</dd>
                </div>
                {isHttpUrl(opp.applyUrl) ? (
                  <div>
                    <dt className="text-xs text-muted-foreground">Application</dt>
                    <dd className="mt-0.5">
                      <a
                        href={opp.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        Open Link <ExternalLink className="size-3" />
                      </a>
                    </dd>
                  </div>
                ) : null}
                {isHttpUrl(opp.orgUrl) ? (
                  <div>
                    <dt className="text-xs text-muted-foreground">Organisation</dt>
                    <dd className="mt-0.5">
                      <a
                        href={opp.orgUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        Website <ExternalLink className="size-3" />
                      </a>
                    </dd>
                  </div>
                ) : null}
                {opp.hasInternalDetails ? (
                  <div>
                    <dt className="text-xs text-muted-foreground">Listing</dt>
                    <dd className="mt-0.5 font-medium">Internal details</dd>
                  </div>
                ) : null}
              </dl>
            </CardContent>
          </Card>

          {opp.status === "rejected" && opp.rejectionReason ? (
            <Alert variant="destructive" className="rounded-2xl">
              <XCircle />
              <AlertTitle>Feedback Sent</AlertTitle>
              <AlertDescription className="whitespace-pre-line">
                {opp.rejectionReason}
              </AlertDescription>
            </Alert>
          ) : null}
        </div>

        <div className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
          <Card className="rounded-2xl shadow-2xs">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Submitted By</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <User className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {opp.submitter?.name ?? "Unknown"}
                </p>
                {opp.submitter?.regNumber ? (
                  <p className="font-mono text-xs text-muted-foreground">{opp.submitter.regNumber}</p>
                ) : null}
                {opp.submitter?.email ? (
                  <p className="truncate text-xs text-muted-foreground">{opp.submitter.email}</p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {opp.status === "submitted" ? (
            <Card className="rounded-2xl shadow-2xs">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Decision</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2.5">
                {confirmApprove ? (
                  <div className="flex flex-col gap-3 rounded-xl border bg-muted/40 p-3.5">
                    <p className="text-xs text-foreground">
                      Publish <strong>{opp.title}</strong> to the opportunities board?
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="h-8 flex-1 rounded-xl text-xs"
                        disabled={reviewMutation.isPending}
                        onClick={() => reviewMutation.mutate({ id: opp.id, status: "approved" })}
                      >
                        {reviewMutation.isPending ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          "Confirm"
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={reviewMutation.isPending}
                        onClick={() => setConfirmApprove(false)}
                        className="h-8 rounded-xl text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Button
                      size="sm"
                      className="h-9 w-full rounded-xl text-xs"
                      onClick={() => setConfirmApprove(true)}
                    >
                      <CheckCircle2 className="size-3.5" />
                      Approve Opportunity
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 w-full rounded-xl border-rose-500/30 text-xs text-rose-600 hover:bg-rose-500/10 hover:text-rose-700 dark:text-rose-400"
                      onClick={() => setRejectOpen(true)}
                    >
                      <MessageSquare className="size-3.5" />
                      Request Changes
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          ) : opp.status === "approved" ? (
            <Alert className="rounded-2xl">
              <CheckCircle2 />
              <AlertTitle>Approved</AlertTitle>
              <AlertDescription className="text-xs">
                Live on the opportunities board.
              </AlertDescription>
            </Alert>
          ) : null}
        </div>
      </div>

      <ReasonDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title="Request Changes"
        subject={opp.title}
        buttonLabel="Send Feedback"
        isPending={reviewMutation.isPending}
        onConfirm={(reason) =>
          reviewMutation.mutate({
            id: opp.id,
            status: "rejected",
            rejectionReason: reason,
          })
        }
      />
    </div>
  );
}
