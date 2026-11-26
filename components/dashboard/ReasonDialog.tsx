"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const MAX_REASON = 500;

const reasonSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, "Feedback must be at least 5 characters.")
    .max(MAX_REASON, `Keep feedback under ${MAX_REASON} characters.`),
});

type ReasonFormValues = z.output<typeof reasonSchema>;

interface ReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subject?: string;
  description?: string;
  buttonLabel?: string;
  isPending: boolean;
  onConfirm: (reason: string) => void;
}

export function ReasonDialog({
  open,
  onOpenChange,
  title,
  subject,
  description = "Explain what needs updating so the student can revise and resubmit.",
  buttonLabel = "Send feedback",
  isPending,
  onConfirm,
}: ReasonDialogProps) {
  const form = useForm<ReasonFormValues>({
    resolver: zodResolver(reasonSchema),
    defaultValues: { reason: "" },
  });

  useEffect(() => {
    if (open) form.reset({ reason: "" });
  }, [open, form]);

  const reasonValue = form.watch("reason");
  const errorMsg = form.formState.errors.reason?.message;

  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
          <DialogDescription className="text-xs">
            {subject ? (
              <span className="mb-1 block font-medium text-foreground">&ldquo;{subject}&rdquo;</span>
            ) : null}
            {description}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit((values) => onConfirm(values.reason))}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <Textarea
              rows={4}
              maxLength={MAX_REASON}
              autoFocus
              aria-invalid={Boolean(errorMsg)}
              placeholder="e.g. Add repository link and clarify project scope."
              className="resize-none rounded-xl text-sm"
              {...form.register("reason")}
            />
            <div className="flex items-center justify-between gap-2 text-[11px]">
              <span className="text-destructive">{errorMsg ?? ""}</span>
              <span className="tabular-nums text-muted-foreground">
                {reasonValue.length}/{MAX_REASON}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="h-9 rounded-xl px-4 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              disabled={isPending}
              className="h-9 rounded-xl px-4 text-xs"
            >
              {isPending ? <Loader2 className="size-3.5 animate-spin" /> : null}
              {isPending ? "Sending..." : buttonLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
