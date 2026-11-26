"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bell,
  Eye,
  EyeOff,
  FilePlus,
  Loader2,
  Pin,
  PinOff,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/dashboard/DashboardStates";
import { PillTabs } from "@/components/dashboard/PillTabs";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { RichTextDoc } from "@/db/json";
import { formatDate } from "@/lib/format";
import { richTextDocToText } from "@/lib/richtext";
import { trpc } from "@/lib/trpc/client";

type NoticeFilter = "all" | "published" | "pinned" | "draft";

export default function CoordinatorNoticesPage() {
  const utils = trpc.useUtils();
  const { data, isLoading, error } = trpc.coordinator.listNotices.useQuery();
  const [filter, setFilter] = useState<NoticeFilter>("all");
  const [search, setSearch] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const publishMutation = trpc.coordinator.publishNotice.useMutation({
    onSuccess: (updated) => {
      utils.coordinator.listNotices.invalidate();
      utils.coordinator.getDepartmentOverview.invalidate();
      toast.success(updated?.published ? "Notice published." : "Moved to drafts.");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.coordinator.updateNotice.useMutation({
    onSuccess: (updated) => {
      utils.coordinator.listNotices.invalidate();
      toast.success(updated?.isPinned ? "Pinned to top." : "Unpinned.");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.coordinator.deleteNotice.useMutation({
    onSuccess: () => {
      setConfirmDeleteId(null);
      utils.coordinator.listNotices.invalidate();
      utils.coordinator.getDepartmentOverview.invalidate();
      toast.success("Notice deleted.");
    },
    onError: (err) => toast.error(err.message),
  });

  const allNotices = useMemo(() => data?.notices ?? [], [data]);

  const counts = useMemo(
    () => ({
      all: allNotices.length,
      published: allNotices.filter((n) => n.published).length,
      pinned: allNotices.filter((n) => n.isPinned).length,
      draft: allNotices.filter((n) => !n.published).length,
    }),
    [allNotices],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allNotices.filter((notice) => {
      if (filter === "published" && !notice.published) return false;
      if (filter === "pinned" && !notice.isPinned) return false;
      if (filter === "draft" && notice.published) return false;
      if (!q) return true;
      return notice.title.toLowerCase().includes(q);
    });
  }, [allNotices, filter, search]);

  const tabs = [
    { value: "all", label: "All", count: counts.all },
    { value: "published", label: "Published", count: counts.published },
    { value: "pinned", label: "Pinned", count: counts.pinned },
    { value: "draft", label: "Drafts", count: counts.draft },
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        title="Notices"
        badge={
          data?.department.shortName ? (
            <Badge variant="outline" className="rounded-full text-[11px] font-semibold">
              {data.department.shortName}
            </Badge>
          ) : null
        }
        action={
          <Button asChild size="sm" className="h-9 rounded-xl px-4 text-xs">
            <Link href="/dashboard/departments/notices/new">
              <FilePlus className="size-3.5" />
              New Notice
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PillTabs label="Filter notices" value={filter} onValueChange={setFilter} tabs={tabs} />
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search notices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 rounded-xl bg-card pl-9 text-xs"
          />
        </div>
      </div>

      {isLoading ? (
        <ListSkeleton count={4} />
      ) : error ? (
        <ErrorState title="Failed to load notices" message={error.message} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Bell className="size-5" />}
          title={allNotices.length ? "No matching notices" : "No notices yet"}
          action={
            <Button asChild size="sm" className="h-9 rounded-xl px-4 text-xs">
              <Link href="/dashboard/departments/notices/new">Publish notice</Link>
            </Button>
          }
        />
      ) : (
        <Card className="divide-y overflow-hidden rounded-2xl py-0 shadow-2xs">
          {filtered.map((notice) => {
            const contentText = notice.contentJson
              ? richTextDocToText(notice.contentJson as RichTextDoc)
              : "";

            return (
              <div
                key={notice.id}
                className="flex flex-col justify-between gap-3 p-4 transition-colors hover:bg-muted/35 sm:flex-row sm:items-center sm:px-5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={notice.published ? "approved" : "draft"} />
                    {notice.isPinned ? (
                      <Badge variant="outline" className="gap-1 rounded-full text-[11px]">
                        <Pin className="size-3" />
                        Pinned
                      </Badge>
                    ) : null}
                    <span className="text-[11px] text-muted-foreground">
                      {formatDate(notice.createdAt)}
                      {notice.authorName ? ` · ${notice.authorName}` : ""}
                    </span>
                  </div>

                  <h3 className="mt-1.5 line-clamp-1 text-sm font-semibold text-foreground">
                    {notice.title}
                  </h3>
                  {contentText ? (
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {contentText}
                    </p>
                  ) : null}
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label={notice.isPinned ? "Unpin notice" : "Pin notice"}
                    disabled={updateMutation.isPending || !notice.contentJson}
                    onClick={() => {
                      if (!notice.contentJson) return;
                      updateMutation.mutate({
                        id: notice.id,
                        title: notice.title,
                        contentJson: notice.contentJson as RichTextDoc,
                        isPinned: !notice.isPinned,
                        published: notice.published,
                      });
                    }}
                    className="size-8 rounded-xl"
                  >
                    {notice.isPinned ? (
                      <PinOff className="size-3.5" />
                    ) : (
                      <Pin className="size-3.5" />
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={publishMutation.isPending}
                    onClick={() =>
                      publishMutation.mutate({
                        id: notice.id,
                        published: !notice.published,
                      })
                    }
                    className="h-8 rounded-xl px-3 text-xs"
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
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="h-8 rounded-xl px-3 text-xs"
                        disabled={deleteMutation.isPending}
                        onClick={() => deleteMutation.mutate({ id: notice.id })}
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          "Delete"
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-xl px-2.5 text-xs"
                        onClick={() => setConfirmDeleteId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      className="size-8 rounded-xl border-rose-500/25 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setConfirmDeleteId(notice.id)}
                      aria-label={`Delete ${notice.title}`}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
