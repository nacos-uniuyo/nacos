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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OpportunityStatus } from "@/lib/enums";
import { projectCategoryLabels } from "@/lib/format";
import { richTextDocToText } from "@/lib/richtext";
import { trpc } from "@/lib/trpc/client";

export default function CoordinatorProjectDetailPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : (params.slug?.[0] ?? "");
  const utils = trpc.useUtils();
  const { data: proj, isLoading, error } = trpc.coordinator.getProject.useQuery({ slug });

  const [confirmApprove, setConfirmApprove] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const reviewMutation = trpc.coordinator.reviewProject.useMutation({
    onSuccess: async (updated) => {
      await utils.coordinator.listProjects.invalidate();
      await utils.coordinator.getProject.invalidate({ slug });
      await utils.coordinator.getDepartmentOverview.invalidate();
      toast.success(
        updated.status === "approved"
          ? "Project approved."
          : "Feedback sent to student.",
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
        <ErrorState title="Could not load proposal" message={error.message} />
        <Button variant="outline" size="sm" asChild className="w-fit rounded-xl text-xs">
          <Link href="/dashboard/departments/projects">
            <ArrowLeft className="size-3.5" />
            Review Queue
          </Link>
        </Button>
      </div>
    );
  }

  if (!proj) return null;

  const descriptionText = proj.descriptionJson
    ? richTextDocToText(proj.descriptionJson as Parameters<typeof richTextDocToText>[0])
    : "";

  const categoryLabel =
    projectCategoryLabels[proj.category as keyof typeof projectCategoryLabels] ?? proj.category;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href="/dashboard/departments/projects"
          className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Review Queue
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={proj.status as OpportunityStatus} />
          <Badge variant="secondary" className="rounded-full text-[11px]">
            {categoryLabel}
          </Badge>
        </div>

        <DashboardHeader title={proj.title} description={proj.tagline ?? undefined} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          {proj.bannerUrl ? (
            <Card className="overflow-hidden rounded-2xl py-0 shadow-2xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={proj.bannerUrl}
                alt={`${proj.title} cover`}
                className="max-h-72 w-full object-cover"
              />
            </Card>
          ) : null}

          {descriptionText ? (
            <Card className="rounded-2xl shadow-2xs">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                  {descriptionText}
                </p>
              </CardContent>
            </Card>
          ) : null}

          <Card className="rounded-2xl shadow-2xs">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                {proj.courseCode ? (
                  <div>
                    <dt className="text-xs text-muted-foreground">Course</dt>
                    <dd className="mt-0.5 font-mono font-medium">{proj.courseCode}</dd>
                  </div>
                ) : null}
                {proj.cohortGroupNumber ? (
                  <div>
                    <dt className="text-xs text-muted-foreground">Cohort</dt>
                    <dd className="mt-0.5 font-medium">Group {proj.cohortGroupNumber}</dd>
                  </div>
                ) : null}
                {proj.teamDisplayName ? (
                  <div>
                    <dt className="text-xs text-muted-foreground">Team</dt>
                    <dd className="mt-0.5 font-medium">{proj.teamDisplayName}</dd>
                  </div>
                ) : null}
                {proj.session?.name ? (
                  <div>
                    <dt className="text-xs text-muted-foreground">Session</dt>
                    <dd className="mt-0.5 font-medium">{proj.session.name}</dd>
                  </div>
                ) : null}
                {proj.repoUrl ? (
                  <div>
                    <dt className="text-xs text-muted-foreground">Repository</dt>
                    <dd className="mt-0.5">
                      <a
                        href={proj.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        Open Repo <ExternalLink className="size-3" />
                      </a>
                    </dd>
                  </div>
                ) : null}
                {proj.demoUrl ? (
                  <div>
                    <dt className="text-xs text-muted-foreground">Live Demo</dt>
                    <dd className="mt-0.5">
                      <a
                        href={proj.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        Open Demo <ExternalLink className="size-3" />
                      </a>
                    </dd>
                  </div>
                ) : null}
              </dl>
            </CardContent>
          </Card>

          {Array.isArray(proj.leadContributors) && proj.leadContributors.length > 0 ? (
            <Card className="rounded-2xl shadow-2xs">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Team</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-wrap gap-2.5">
                  {(proj.leadContributors as { name: string; regNumber?: string; role?: string }[]).map(
                    (c, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2 text-xs"
                      >
                        <Avatar className="size-6">
                          <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                            {c.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">{c.name}</span>
                        {c.role ? (
                          <span className="text-muted-foreground">· {c.role}</span>
                        ) : null}
                      </li>
                    ),
                  )}
                </ul>
              </CardContent>
            </Card>
          ) : null}

          {proj.status === "rejected" && proj.rejectionReason ? (
            <Alert variant="destructive" className="rounded-2xl">
              <XCircle />
              <AlertTitle>Feedback Sent</AlertTitle>
              <AlertDescription className="whitespace-pre-line">
                {proj.rejectionReason}
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
                  {proj.author?.name ?? "Unknown"}
                </p>
                {proj.author?.regNumber ? (
                  <p className="font-mono text-xs text-muted-foreground">{proj.author.regNumber}</p>
                ) : null}
                {proj.author?.email ? (
                  <p className="truncate text-xs text-muted-foreground">{proj.author.email}</p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {proj.status === "submitted" ? (
            <Card className="rounded-2xl shadow-2xs">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Decision</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2.5">
                {confirmApprove ? (
                  <div className="flex flex-col gap-3 rounded-xl border bg-muted/40 p-3.5">
                    <p className="text-xs text-foreground">
                      Publish <strong>{proj.title}</strong> to the showcase?
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="h-8 flex-1 rounded-xl text-xs"
                        disabled={reviewMutation.isPending}
                        onClick={() =>
                          reviewMutation.mutate({ id: proj.id, status: "approved" })
                        }
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
                      Approve Project
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
          ) : proj.status === "approved" ? (
            <Alert className="rounded-2xl">
              <CheckCircle2 />
              <AlertTitle>Approved</AlertTitle>
              <AlertDescription className="text-xs">
                Live on the department showcase.
              </AlertDescription>
            </Alert>
          ) : null}
        </div>
      </div>

      <ReasonDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title="Request Changes"
        subject={proj.title}
        buttonLabel="Send Feedback"
        isPending={reviewMutation.isPending}
        onConfirm={(reason) =>
          reviewMutation.mutate({
            id: proj.id,
            status: "rejected",
            rejectionReason: reason,
          })
        }
      />
    </div>
  );
}
