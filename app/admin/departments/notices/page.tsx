"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Eye,
  EyeOff,
  FilePlus,
  Loader2,
  Pin,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";
import { richTextDocToText } from "@/lib/richtext";

export default function CoordinatorNoticesPage() {
  const utils = trpc.useUtils();
  const { data, isLoading, error } = trpc.coordinator.listNotices.useQuery();

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const publishMutation = trpc.coordinator.publishNotice.useMutation({
    onSuccess: () => utils.coordinator.listNotices.invalidate(),
  });

  const deleteMutation = trpc.coordinator.deleteNotice.useMutation({
    onSuccess: () => {
      setConfirmDeleteId(null);
      utils.coordinator.listNotices.invalidate();
    },
  });

  const notices = data?.notices ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
            Department Console
          </p>
          <h1 className="serif mt-1 text-3xl font-bold tracking-tight text-[var(--ink)]">
            Department Notices
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Publish announcements and academic updates to your department.
          </p>
        </div>
        <Button asChild className="bg-[var(--forest)] hover:bg-[var(--forest)]/90 text-white gap-2">
          <Link href="/admin/departments/notices/new">
            <FilePlus className="size-4" />
            New Notice
          </Link>
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex min-h-48 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-[var(--muted)]" />
        </div>
      ) : error ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-2 text-center">
          <AlertCircle className="size-7 text-destructive" />
          <p className="text-sm font-medium text-[var(--ink)]">Failed to load notices</p>
          <p className="text-xs text-[var(--muted)]">{error.message}</p>
        </div>
      ) : notices.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[var(--rule)] bg-[var(--sand)]/30 text-center">
          <Bell className="size-8 text-[var(--muted)]" />
          <div>
            <p className="font-medium text-[var(--ink)]">No notices published yet</p>
            <p className="mt-0.5 text-sm text-[var(--muted)]">
              Create announcements and academic circulars for your department.
            </p>
          </div>
          <Button asChild size="sm" className="bg-[var(--forest)] hover:bg-[var(--forest)]/90 text-white">
            <Link href="/admin/departments/notices/new">Create First Notice</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-[var(--muted)]">
            {notices.length} notice{notices.length !== 1 ? "s" : ""}
          </p>

          <div className="space-y-3">
            {notices.map((notice) => {
              const contentText = notice.contentJson
                ? richTextDocToText(notice.contentJson as Parameters<typeof richTextDocToText>[0])
                : "";

              return (
                <div
                  key={notice.id}
                  className="flex flex-col gap-3 rounded-xl border border-[var(--rule)] bg-white p-5 shadow-xs transition-shadow hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {notice.isPinned && (
                        <span className="inline-flex items-center gap-1 rounded bg-[var(--gold)]/20 px-2 py-0.5 text-[0.65rem] font-bold text-[var(--forest)]">
                          <Pin className="size-3" />
                          Pinned
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[0.65rem] font-medium ${
                          notice.published
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-[var(--sand)] text-[var(--muted)]"
                        }`}
                      >
                        {notice.published ? (
                          <>
                            <CheckCircle2 className="size-3" />
                            Published
                          </>
                        ) : (
                          "Draft"
                        )}
                      </span>
                      {notice.createdAt && (
                        <span className="text-xs text-[var(--muted)]">
                          {new Date(notice.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-[var(--ink)] line-clamp-1">
                      {notice.title}
                    </h3>
                    {contentText && (
                      <p className="text-xs text-[var(--muted)] line-clamp-2">
                        {contentText}
                      </p>
                    )}
                    {notice.authorName && (
                      <p className="text-xs text-[var(--muted)]">
                        By {notice.authorName}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-xs"
                      disabled={publishMutation.isPending}
                      onClick={() =>
                        publishMutation.mutate({
                          id: notice.id,
                          published: !notice.published,
                        })
                      }
                    >
                      {notice.published ? (
                        <>
                          <EyeOff className="size-3.5" />
                          Unpublish
                        </>
                      ) : (
                        <>
                          <Eye className="size-3.5" />
                          Publish
                        </>
                      )}
                    </Button>

                    {confirmDeleteId === notice.id ? (
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="text-xs"
                          disabled={deleteMutation.isPending}
                          onClick={() => deleteMutation.mutate({ id: notice.id })}
                        >
                          {deleteMutation.isPending ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            "Confirm"
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => setConfirmDeleteId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => setConfirmDeleteId(notice.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
