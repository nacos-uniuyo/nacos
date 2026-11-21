"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { trpc } from "@/lib/trpc/client";
import { richTextDocToText } from "@/lib/richtext";

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
      setFeedbackMsg({ ok: true, text: action === "approve" ? "Project approved successfully." : "Feedback sent. Project returned for revision." });
      setConfirmState("done");
      setAction(null);
    },
    onError: (err: { message: string }) => {
      setFeedbackMsg({ ok: false, text: err.message });
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
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-[var(--muted)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
        <AlertCircle className="size-8 text-destructive" />
        <p className="font-medium text-[var(--ink)]">Could not load proposal</p>
        <p className="text-sm text-[var(--muted)]">{error.message}</p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/departments/projects">← Back to Queue</Link>
        </Button>
      </div>
    );
  }

  if (!proj) return null;

  const descriptionText = proj.descriptionJson ? richTextDocToText(proj.descriptionJson as Parameters<typeof richTextDocToText>[0]) : "";

  return (
    <div className="space-y-6">
      {/* Back */}
      <div>
        <Button variant="ghost" size="sm" className="gap-1.5 text-[var(--muted)] hover:text-[var(--ink)] -ml-2" asChild>
          <Link href="/admin/departments/projects">
            <ArrowLeft className="size-3.5" />
            Review Queue
          </Link>
        </Button>
      </div>

      {/* Title Row */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <StatusBadge status={proj.status as "draft" | "submitted" | "approved" | "rejected"} />
            {proj.category && (
              <span className="rounded bg-[var(--sand)] px-2 py-0.5 text-xs font-medium text-[var(--muted)] capitalize">
                {proj.category.replace(/_/g, " ")}
              </span>
            )}
          </div>
          <h1 className="serif text-2xl font-bold tracking-tight text-[var(--ink)] sm:text-3xl">
            {proj.title}
          </h1>
          {proj.tagline && (
            <p className="mt-1 text-[var(--muted)]">{proj.tagline}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Description */}
          {descriptionText && (
            <section className="rounded-xl border border-[var(--rule)] bg-white p-6 shadow-xs">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-[var(--muted)]">
                Description
              </h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--ink)]">
                {descriptionText}
              </p>
            </section>
          )}

          {/* Project Details */}
          <section className="rounded-xl border border-[var(--rule)] bg-white p-6 shadow-xs">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[var(--muted)]">
              Project Details
            </h2>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              {proj.courseCode && (
                <>
                  <dt className="text-[var(--muted)]">Course Code</dt>
                  <dd className="font-mono font-medium text-[var(--ink)]">{proj.courseCode}</dd>
                </>
              )}
              {proj.cohortGroupNumber && (
                <>
                  <dt className="text-[var(--muted)]">Cohort Group</dt>
                  <dd className="font-medium text-[var(--ink)]">Group {proj.cohortGroupNumber}</dd>
                </>
              )}
              {proj.teamDisplayName && (
                <>
                  <dt className="text-[var(--muted)]">Team Name</dt>
                  <dd className="font-medium text-[var(--ink)]">{proj.teamDisplayName}</dd>
                </>
              )}
              {proj.session?.name && (
                <>
                  <dt className="text-[var(--muted)]">Academic Session</dt>
                  <dd className="font-medium text-[var(--ink)]">{proj.session.name}</dd>
                </>
              )}
              {proj.repoUrl && (
                <>
                  <dt className="text-[var(--muted)]">Repository</dt>
                  <dd>
                    <a
                      href={proj.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[var(--forest)] hover:underline font-medium"
                    >
                      View Repo <ExternalLink className="size-3" />
                    </a>
                  </dd>
                </>
              )}
              {proj.demoUrl && (
                <>
                  <dt className="text-[var(--muted)]">Live Demo</dt>
                  <dd>
                    <a
                      href={proj.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[var(--forest)] hover:underline font-medium"
                    >
                      View Demo <ExternalLink className="size-3" />
                    </a>
                  </dd>
                </>
              )}
            </dl>
          </section>

          {/* Banner */}
          {proj.bannerUrl && (
            <section className="overflow-hidden rounded-xl border border-[var(--rule)] shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={proj.bannerUrl}
                alt={`${proj.title} banner`}
                className="w-full max-h-56 object-cover"
              />
            </section>
          )}

          {/* Contributors */}
          {proj.leadContributors && Array.isArray(proj.leadContributors) && proj.leadContributors.length > 0 && (
            <section className="rounded-xl border border-[var(--rule)] bg-white p-6 shadow-xs">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-[var(--muted)]">
                Lead Contributors
              </h2>
              <ul className="space-y-2">
                {(proj.leadContributors as { name: string; regNumber?: string; role?: string }[]).map((c, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--sand)] text-[0.65rem] font-bold text-[var(--muted)]">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-[var(--ink)]">{c.name}</span>
                    {c.regNumber && <span className="text-[var(--muted)]">{c.regNumber}</span>}
                    {c.role && (
                      <span className="rounded bg-[var(--sand)] px-1.5 py-0.5 text-[0.65rem] text-[var(--muted)]">
                        {c.role}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Existing Rejection Reason */}
          {proj.status === "rejected" && proj.rejectionReason && (
            <section className="rounded-xl border border-red-200 bg-red-50 p-6">
              <div className="flex items-start gap-3">
                <XCircle className="mt-0.5 size-5 shrink-0 text-red-600" />
                <div>
                  <h2 className="font-semibold text-red-900">Coordinator Feedback</h2>
                  <p className="mt-1 text-sm text-red-800 whitespace-pre-line">{proj.rejectionReason}</p>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Right Sidebar: Author + Review */}
        <div className="space-y-6">
          {/* Author Info */}
          <section className="rounded-xl border border-[var(--rule)] bg-white p-5 shadow-xs">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[var(--muted)]">
              Submitted By
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--forest)]/10 text-sm font-bold text-[var(--forest)]">
                <User className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-[var(--ink)] truncate">{proj.author?.name ?? "Unknown"}</p>
                {proj.author?.regNumber && (
                  <p className="text-xs font-mono text-[var(--muted)]">{proj.author.regNumber}</p>
                )}
                {proj.author?.email && (
                  <p className="text-xs text-[var(--muted)] truncate">{proj.author.email}</p>
                )}
              </div>
            </div>
          </section>

          {/* Feedback Message */}
          {feedbackMsg && (
            <div className={`rounded-lg border p-4 ${feedbackMsg.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}>
              <div className="flex items-start gap-2 text-sm">
                {feedbackMsg.ok ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-600" />
                )}
                <span>{feedbackMsg.text}</span>
              </div>
              {feedbackMsg.ok && (
                <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => router.push("/admin/departments/projects")}>
                  Back to Queue
                </Button>
              )}
            </div>
          )}

          {/* Review Actions */}
          {proj.status === "submitted" && confirmState !== "done" && (
            <section className="rounded-xl border border-[var(--rule)] bg-white p-5 shadow-xs space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--muted)]">
                Review Decision
              </h2>

              {confirmState === "idle" && (
                <div className="space-y-2">
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                    onClick={() => startAction("approve")}
                  >
                    <CheckCircle2 className="size-4" />
                    Approve Project
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
                    onClick={() => startAction("reject")}
                  >
                    <MessageSquare className="size-4" />
                    Request Changes
                  </Button>
                </div>
              )}

              {confirmState === "confirming" && action === "approve" && (
                <div className="space-y-3">
                  <p className="text-sm text-[var(--ink)]">
                    Approve <strong>{proj.title}</strong>? This will mark the project as publicly approved.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      disabled={reviewMutation.isPending}
                      onClick={submitReview}
                    >
                      {reviewMutation.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        "Confirm Approval"
                      )}
                    </Button>
                    <Button variant="outline" onClick={cancelAction} disabled={reviewMutation.isPending}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {confirmState === "confirming" && action === "reject" && (
                <div className="space-y-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[var(--ink)]">
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
                      <p className="mt-1 text-xs text-destructive">Feedback must be at least 5 characters.</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      disabled={reviewMutation.isPending || rejectionReason.trim().length < 5}
                      onClick={submitReview}
                    >
                      {reviewMutation.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        "Send Feedback"
                      )}
                    </Button>
                    <Button variant="outline" onClick={cancelAction} disabled={reviewMutation.isPending}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </section>
          )}

          {proj.status === "approved" && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
              <CheckCircle2 className="mx-auto mb-2 size-8 text-emerald-600" />
              <p className="font-semibold text-emerald-900">Project Approved</p>
              <p className="mt-1 text-xs text-emerald-700">This project has been approved and is publicly visible.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
