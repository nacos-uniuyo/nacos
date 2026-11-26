"use client";

import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import { AlertCircle, ArrowLeft, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { textToRichTextDoc } from "@/lib/richtext";
import { trpc } from "@/lib/trpc/client";

export default function NewNoticePage() {
  const router = useRouter();
  const utils = trpc.useUtils();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [published, setPublished] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const createMutation = trpc.coordinator.createNotice.useMutation({
    onSuccess: async () => {
      await utils.coordinator.listNotices.invalidate();
      toast.success(published ? "Notice published." : "Notice saved as draft.");
      router.push("/dashboard/departments/notices");
    },
    onError: (err: { message: string }) => {
      setErrorMsg(err.message);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (title.trim().length < 3) {
      setErrorMsg("Title must be at least 3 characters.");
      return;
    }

    if (!content.trim()) {
      setErrorMsg("Notice content cannot be empty.");
      return;
    }

    createMutation.mutate({
      title: title.trim(),
      contentJson: textToRichTextDoc(content.trim()),
      isPinned,
      published,
    });
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Button variant="ghost" size="sm" className="-ml-2 gap-1.5 text-muted-foreground" asChild>
          <Link href="/dashboard/departments/notices">
            <ArrowLeft className="size-3.5" />
            Back to notices
          </Link>
        </Button>
      </div>

      <DashboardHeader
        title="Publish Department Notice"
        description="Announcements are visible to all students in your academic department."
      />

      {errorMsg && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Could not publish notice</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label htmlFor="title" className="block text-sm font-medium text-foreground">
                Notice Title <span className="text-destructive">*</span>
              </label>
              <Input
                id="title"
                placeholder="e.g., CSC 411 Continuous Assessment Rescheduled"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={255}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="content" className="block text-sm font-medium text-foreground">
                Content <span className="text-destructive">*</span>
              </label>
              <Textarea
                id="content"
                placeholder="Write your announcement details, instructions, or deadlines here…"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                required
              />
              <p className="text-xs text-muted-foreground">
                Paragraphs and line breaks will be preserved.
              </p>
            </div>

            <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Options
              </p>

              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="size-4 rounded border-border accent-primary"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">Pin to top</p>
                  <p className="text-xs text-muted-foreground">
                    Displays this notice prominently at the top of the department board.
                  </p>
                </div>
              </label>

              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="size-4 rounded border-border accent-primary"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">Publish immediately</p>
                  <p className="text-xs text-muted-foreground">
                    Make visible right away. Uncheck to save as draft.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" asChild disabled={createMutation.isPending}>
                <Link href="/dashboard/departments/notices">Cancel</Link>
              </Button>

              <Button type="submit" className="gap-2" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Publishing…
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    {published ? "Publish Notice" : "Save Draft"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
