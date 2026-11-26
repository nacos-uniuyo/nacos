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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      await utils.coordinator.getDepartmentOverview.invalidate();
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
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href="/dashboard/departments/notices"
          className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Notices
        </Link>

        <DashboardHeader title="Publish Notice" />
      </div>

      {errorMsg ? (
        <Alert variant="destructive" className="rounded-2xl">
          <AlertCircle />
          <AlertTitle>Could not save notice</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="rounded-2xl shadow-2xs">
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title" className="text-xs">
                Title
              </Label>
              <Input
                id="title"
                placeholder="e.g. CSC 411 Continuous Assessment Rescheduled"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={255}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="content" className="text-xs">
                Content
              </Label>
              <Textarea
                id="content"
                placeholder="Write announcement details and deadlines..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={7}
                required
              />
            </div>

            <div className="flex flex-wrap gap-5 rounded-xl border bg-muted/35 p-4">
              <label className="flex cursor-pointer items-center gap-2.5 text-xs font-medium text-foreground">
                <Checkbox
                  checked={isPinned}
                  onCheckedChange={(checked) => setIsPinned(Boolean(checked))}
                />
                <span>Pin to top</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2.5 text-xs font-medium text-foreground">
                <Checkbox
                  checked={published}
                  onCheckedChange={(checked) => setPublished(Boolean(checked))}
                />
                <span>Publish immediately</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                asChild
                disabled={createMutation.isPending}
                className="h-9 rounded-xl px-4 text-xs"
              >
                <Link href="/dashboard/departments/notices">Cancel</Link>
              </Button>

              <Button
                type="submit"
                size="sm"
                disabled={createMutation.isPending}
                className="h-9 rounded-xl px-4 text-xs"
              >
                {createMutation.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Send className="size-3.5" />
                )}
                {createMutation.isPending
                  ? "Saving..."
                  : published
                    ? "Publish Notice"
                    : "Save Draft"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
