"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, Eye, EyeOff, FilePlus, Loader2, Pin, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/dashboard/DashboardStates";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { richTextDocToText } from "@/lib/richtext";
import { trpc } from "@/lib/trpc/client";

export default function CoordinatorNoticesPage() {
  const utils = trpc.useUtils();
  const { data, isLoading, error } = trpc.coordinator.listNotices.useQuery();

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const publishMutation = trpc.coordinator.publishNotice.useMutation({
    onSuccess: (updated) => {
      utils.coordinator.listNotices.invalidate();
      toast.success(updated?.published ? "Notice published." : "Notice unpublished.");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.coordinator.deleteNotice.useMutation({
    onSuccess: () => {
      setConfirmDeleteId(null);
      utils.coordinator.listNotices.invalidate();
      toast.success("Notice deleted.");
    },
    onError: (err) => toast.error(err.message),
  });

  const notices = data?.notices ?? [];

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Department Notices"
        description="Publish announcements and academic updates to students in your department."
        action={
          <Button asChild size="sm">
            <Link href="/dashboard/departments/notices/new">
              <FilePlus className="size-4" />
              New notice
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <ListSkeleton count={4} />
      ) : error ? (
        <ErrorState title="Failed to load notices" message={error.message} />
      ) : notices.length === 0 ? (
        <EmptyState
          icon={<Bell className="size-5" />}
          title="No notices published yet"
          description="Create announcements and academic circulars for your department."
          action={
            <Button asChild size="sm">
              <Link href="/dashboard/departments/notices/new">Create first notice</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            {notices.length} notice{notices.length !== 1 ? "s" : ""}
          </p>

          <Card className="divide-y overflow-hidden py-0">
            {notices.map((notice) => {
              const contentText = notice.contentJson
                ? richTextDocToText(notice.contentJson as Parameters<typeof richTextDocToText>[0])
                : "";

              return (
                <div
                  key={notice.id}
                  className="flex flex-col gap-3 p-5 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={notice.published ? "approved" : "draft"} />
                      {notice.isPinned && (
                        <Badge variant="outline" className="gap-1">
                          <Pin className="size-3" />
                          Pinned
                        </Badge>
                      )}
                      {notice.createdAt && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(notice.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground line-clamp-1">{notice.title}</h3>
                    {contentText && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{contentText}</p>
                    )}
                    {notice.authorName && (
                      <p className="text-xs text-muted-foreground">By {notice.authorName}</p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs"
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
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
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
        </div>
      )}
    </div>
  );
}
