"use client";

import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import { AlertCircle, ArrowLeft, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      router.push("/admin/departments/notices");
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
      {/* Back button */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-[var(--muted)] hover:text-[var(--ink)] -ml-2"
          asChild
        >
          <Link href="/admin/departments/notices">
            <ArrowLeft className="size-3.5" />
            Back to Notices
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
          Department Console
        </p>
        <h1 className="serif mt-1 text-3xl font-bold tracking-tight text-[var(--ink)]">
          Publish Department Notice
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Announcements are visible to all students in your academic department.
        </p>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-[var(--rule)] bg-white p-6 shadow-xs">
        {/* Title */}
        <div className="space-y-1.5">
          <label htmlFor="title" className="block text-sm font-semibold text-[var(--ink)]">
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

        {/* Content */}
        <div className="space-y-1.5">
          <label htmlFor="content" className="block text-sm font-semibold text-[var(--ink)]">
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
          <p className="text-xs text-[var(--muted)]">
            Paragraphs and line breaks will be preserved.
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3 rounded-lg border border-[var(--rule)] bg-[var(--sand)]/20 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Options
          </p>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="size-4 rounded border-[var(--rule)] accent-[var(--forest)]"
            />
            <div>
              <p className="text-sm font-medium text-[var(--ink)]">Pin to top</p>
              <p className="text-xs text-[var(--muted)]">
                Displays this notice prominently at the top of the department board.
              </p>
            </div>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="size-4 rounded border-[var(--rule)] accent-[var(--forest)]"
            />
            <div>
              <p className="text-sm font-medium text-[var(--ink)]">Publish immediately</p>
              <p className="text-xs text-[var(--muted)]">
                Make visible right away. Uncheck to save as draft.
              </p>
            </div>
          </label>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            asChild
            disabled={createMutation.isPending}
          >
            <Link href="/admin/departments/notices">Cancel</Link>
          </Button>

          <Button
            type="submit"
            className="bg-[var(--forest)] hover:bg-[var(--forest)]/90 text-white gap-2"
            disabled={createMutation.isPending}
          >
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
    </div>
  );
}
