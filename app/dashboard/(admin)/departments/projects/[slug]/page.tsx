"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import {
  AlertCircle,
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
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { richTextDocToText } from "@/lib/richtext";
import { trpc } from "@/lib/trpc/client";

export default function CoordinatorProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params.slug === "string" ? params.slug : (params.slug?.[0] ?? "");

  const utils = trpc.useUtils();
  const { data: proj, isLoading, error } = trpc.coordinator.getProject.useQuery({ slug });

  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [confirmState, setConfirmState] = useState<"idle" | "confirming" | "done">("idle");
  const [feedbackMsg, setFeedbackMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const reviewMutation = trpc.coordinator.reviewProject.useMutation({
    onSuccess: async () => {
      await utils.coordinator.listProjects.invalidate();
      await utils.coordinator.getProject.invalidate({ slug });
      const text =
        action === "approve"
          ? "Project approved successfully."
          : "Feedback sent. Project returned for revision.";
      setFeedbackMsg({ ok: true, text });
      toast.success(text);
      setConfirmState("done");
      setAction(null);
    },
    onError: (err: { message: string }) => {
      setFeedbackMsg({ ok: false, text: err.message });
      toast.error(err.message);
      setConfirmState("idle");
    },
  });

  function startAction(a: "approve" | "reject") {
    setAction(a);
    setRejectionReason("");
    setFeedbackMsg(null);
    setConfirmState("confirming");
  }

  function cancelAction() {
    setAction(null);
    setConfirmState("idle");
    setFeedbackMsg(null);
  }

  function submitReview() {
    if (!proj) return;
    if (action === "reject" && !rejectionReason.trim()) return;
    reviewMutation.mutate({
      id: proj.id,
      status: action === "approve" ? "approved" : "rejected",
      rejectionReason: action === "reject" ? rejectionReason.trim() : undefined,
    });
  }

  if (isLoading) {
    return <ListSkeleton count={3} />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <ErrorState title="Could not load proposal" message={error.message} />
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/departments/projects">← Back to queue</Link>
        </Button>
      </div>
    );
  }

  if (!proj) return null;

  const descriptionText = proj.descriptionJson
    ? richTextDocToText(proj.descriptionJson as Parameters<typeof richTextDocToText>[0])
    : "";

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" className="-ml-2 gap-1.5 text-muted-foreground" asChild>
          <Link href="/dashboard/departments/projects">
            <ArrowLeft className="size-3.5" />
            Review queue
          </Link>
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={proj.status as "draft" | "submitted" | "approved" | "rejected"} />
          {proj.category && (
            <Badge variant="secondary" className="capitalize">
              {proj.category.replace(/_/g, " ")}
            </Badge>
          )}
        </div>
        <DashboardHeader title={proj.title} description={proj.tagline ?? undefined} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {descriptionText && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                  {descriptionText}
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                {proj.courseCode && (
                  <>
                    <dt className="text-muted-foreground">Course Code</dt>
                    <dd className="font-mono font-medium text-foreground">{proj.courseCode}</dd>
                  </>
                )}
                {proj.cohortGroupNumber && (
                  <>
                    <dt className="text-muted-foreground">Cohort Group</dt>
                    <dd className="font-medium text-foreground">Group {proj.cohortGroupNumber}</dd>
                  </>
                )}
                {proj.teamDisplayName && (
                  <>
                    <dt className="text-muted-foreground">Team Name</dt>
                    <dd className="font-medium text-foreground">{proj.teamDisplayName}</dd>
                  </>
                )}
                {proj.session?.name && (
                  <>
                    <dt className="text-muted-foreground">Academic Session</dt>
                    <dd className="font-medium text-foreground">{proj.session.name}</dd>
                  </>
                )}
                {proj.repoUrl && (
                  <>
                    <dt className="text-muted-foreground">Repository</dt>
                    <dd>
                      <a
                        href={proj.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                      >
                        View Repo <ExternalLink className="size-3" />
                      </a>
                    </dd>
                  </>
                )}
                {proj.demoUrl && (
                  <>
                    <dt className="text-muted-foreground">Live Demo</dt>
                    <dd>
                      <a
                        href={proj.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                      >
                        View Demo <ExternalLink className="size-3" />
                      </a>
                    </dd>
                  </>
                )}
              </dl>
            </CardContent>
          </Card>

          {proj.bannerUrl && (
            <Card className="overflow-hidden py-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={proj.bannerUrl}
                alt={`${proj.title} banner`}
                className="max-h-56 w-full object-cover"
              />
            </Card>
          )}

          {proj.leadContributors &&
            Array.isArray(proj.leadContributors) &&
            proj.leadContributors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Lead Contributors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2.5">
                    {(proj.leadContributors as { name: string; regNumber?: string; role?: string }[]).map(
                      (c, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm">
                          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[0.65rem] font-bold text-muted-foreground">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-foreground">{c.name}</span>
                          {c.regNumber && <span className="text-muted-foreground">{c.regNumber}</span>}
                          {c.role && <Badge variant="secondary">{c.role}</Badge>}
                        </li>
                      ),
                    )}
                  </ul>
                </CardContent>
              </Card>
            )}

          {proj.status === "rejected" && proj.rejectionReason && (
            <Alert variant="destructive">
              <XCircle />
              <AlertTitle>Coordinator Feedback</AlertTitle>
              <AlertDescription className="whitespace-pre-line">
                {proj.rejectionReason}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Submitted By
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">
                    {proj.author?.name ?? "Unknown"}
                  </p>
                  {proj.author?.regNumber && (
                    <p className="font-mono text-xs text-muted-foreground">{proj.author.regNumber}</p>
                  )}
                  {proj.author?.email && (
                    <p className="truncate text-xs text-muted-foreground">{proj.author.email}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {feedbackMsg && (
            <Alert variant={feedbackMsg.ok ? "default" : "destructive"}>
              {feedbackMsg.ok ? <CheckCircle2 /> : <AlertCircle />}
              <AlertTitle>{feedbackMsg.ok ? "Review saved" : "Review failed"}</AlertTitle>
              <AlertDescription>
                <p>{feedbackMsg.text}</p>
                {feedbackMsg.ok && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 w-full"
                    onClick={() => router.push("/dashboard/departments/projects")}
                  >
                    Back to queue
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}

          {proj.status === "submitted" && confirmState !== "done" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Review Decision
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {confirmState === "idle" && (
                  <div className="space-y-2">
                    <Button className="w-full gap-2" onClick={() => startAction("approve")}>
                      <CheckCircle2 className="size-4" />
                      Approve Project
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => startAction("reject")}
                    >
                      <MessageSquare className="size-4" />
                      Request Changes
                    </Button>
                  </div>
                )}

                {confirmState === "confirming" && action === "approve" && (
                  <div className="space-y-3">
                    <p className="text-sm text-foreground">
                      Approve <strong>{proj.title}</strong>? This will mark the project as publicly
                      approved.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        disabled={reviewMutation.isPending}
                        onClick={submitReview}
                      >
                        {reviewMutation.isPending ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          "Confirm Approval"
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={cancelAction}
                        disabled={reviewMutation.isPending}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {confirmState === "confirming" && action === "reject" && (
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        Feedback for student <span className="text-destructive">*</span>
                      </label>
                      <Textarea
                        placeholder="Explain what needs to be improved or corrected…"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={4}
                        className="text-sm"
                      />
                      {rejectionReason.trim().length > 0 && rejectionReason.trim().length < 5 && (
                        <p className="mt-1 text-xs text-destructive">
                          Feedback must be at least 5 characters.
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        className="flex-1"
                        disabled={reviewMutation.isPending || rejectionReason.trim().length < 5}
                        onClick={submitReview}
                      >
                        {reviewMutation.isPending ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          "Send Feedback"
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={cancelAction}
                        disabled={reviewMutation.isPending}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {proj.status === "approved" && (
            <Alert>
              <CheckCircle2 />
              <AlertTitle>Project Approved</AlertTitle>
              <AlertDescription>
                This project has been approved and is publicly visible.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
