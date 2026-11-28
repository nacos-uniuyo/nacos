"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ArrowLeft, Loader2, RotateCcw, Save } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ErrorState } from "@/components/dashboard/DashboardStates";
import { RichTextRenderer } from "@/components/RichTextRenderer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc/client";
import { type DeansMessageInput, deansMessageInput } from "@/server/contracts";

const emptyMessage: DeansMessageInput = {
  heading: "",
  body: "",
  authorName: "",
  authorTitle: "",
};

export default function DeansMessagePage() {
  const { data, isLoading, error } = trpc.setting.deansMessage.useQuery();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href="/dashboard/admin"
          className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Control Center
        </Link>
        <DashboardHeader
          title="Dean's message"
          description="The welcome note shown on the homepage, right after the hero."
        />
      </div>

      {isLoading ? (
        <EditorSkeleton />
      ) : error ? (
        <ErrorState title="Could not load the Dean's message" message={error.message} />
      ) : (
        <DeansMessageEditor
          saved={
            data
              ? {
                  heading: data.heading,
                  body: data.body,
                  authorName: data.authorName,
                  authorTitle: data.authorTitle,
                }
              : emptyMessage
          }
        />
      )}
    </div>
  );
}

function DeansMessageEditor({ saved }: { saved: DeansMessageInput }) {
  const utils = trpc.useUtils();
  const form = useForm({
    resolver: zodResolver(deansMessageInput),
    defaultValues: saved,
  });
  const preview = useWatch({ control: form.control });
  const { isDirty } = form.formState;

  const saveMutation = trpc.admin.updateDeansMessage.useMutation({
    onSuccess: (message) => {
      utils.setting.deansMessage.setData(undefined, message);
      // The saved values become the new baseline for Reset and the dirty check.
      form.reset({
        heading: message.heading,
        body: message.body,
        authorName: message.authorName,
        authorTitle: message.authorTitle,
      });
      toast.success("Dean's message saved", {
        description: "The homepage now shows the new message.",
      });
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
      <Form {...form}>
        <form onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}>
          <Card className="rounded-2xl shadow-2xs">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Message</CardTitle>
            </CardHeader>
            {/* Locked while saving, so nothing typed during the request is lost on reset. */}
            <CardContent>
              <fieldset disabled={saveMutation.isPending} className="flex min-w-0 flex-col gap-4">
                <FormField
                  control={form.control}
                  name="heading"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Heading</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Welcome to the Faculty of Computing" maxLength={120} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="body"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Message</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={10}
                          maxLength={4000}
                          placeholder="Write the Dean's welcome note."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-[11px]">
                        Leave a blank line between paragraphs.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="authorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Author name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Prof. Uduak A. Umoh" maxLength={128} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="authorTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Author title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Dean, Faculty of Computing" maxLength={128} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </fieldset>
            </CardContent>
            <CardFooter className="justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!isDirty || saveMutation.isPending}
                onClick={() => form.reset()}
                className="h-9 rounded-xl px-4 text-xs"
              >
                <RotateCcw className="size-3.5" />
                Reset
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!isDirty || saveMutation.isPending}
                className="h-9 rounded-xl px-5 text-xs"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Save className="size-3.5" />
                )}
                {saveMutation.isPending ? "Saving..." : "Save message"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>

      <Card className="rounded-2xl shadow-2xs">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Preview</CardTitle>
          <CardDescription>How the message reads on the homepage.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {preview.heading?.trim() || "Heading"}
          </h2>
          <blockquote className="border-l-2 border-primary pl-4 text-sm leading-relaxed text-foreground">
            {preview.body?.trim() ? (
              <RichTextRenderer doc={preview.body} />
            ) : (
              <p className="text-muted-foreground">The message will appear here.</p>
            )}
          </blockquote>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-foreground">
              {preview.authorName?.trim() || "Author name"}
            </span>
            <span className="text-xs text-muted-foreground">
              {preview.authorTitle?.trim() || "Author title"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EditorSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-2 lg:items-start" aria-busy="true" aria-label="Loading">
      <Card className="rounded-2xl shadow-2xs">
        <CardContent className="flex flex-col gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-full rounded-md" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-52 w-full rounded-md" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-9 w-full rounded-md" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-2xl shadow-2xs">
        <CardContent className="flex flex-col gap-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>
    </div>
  );
}
