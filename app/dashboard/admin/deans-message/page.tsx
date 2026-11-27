"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ArrowLeft, Loader2, RotateCcw, Save } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
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
import { Textarea } from "@/components/ui/textarea";
import { deansMessage } from "@/mocks/portal";

const deansMessageSchema = z.object({
  heading: z
    .string()
    .trim()
    .min(1, "Add a heading.")
    .max(120, "Keep the heading under 120 characters."),
  body: z.string().trim().min(1, "Write the message."),
  authorName: z
    .string()
    .trim()
    .min(1, "Add the author's name.")
    .max(128, "Keep the name under 128 characters."),
  authorTitle: z
    .string()
    .trim()
    .min(1, "Add the author's title.")
    .max(128, "Keep the title under 128 characters."),
});

type DeansMessageValues = z.infer<typeof deansMessageSchema>;

const savedValues: DeansMessageValues = {
  heading: deansMessage.heading,
  body: deansMessage.body,
  authorName: deansMessage.authorName,
  authorTitle: deansMessage.authorTitle,
};

export default function DeansMessagePage() {
  const form = useForm({
    resolver: zodResolver(deansMessageSchema),
    defaultValues: savedValues,
  });
  const preview = useWatch({ control: form.control });
  const { isDirty, isSubmitting } = form.formState;

  // UI only for now: nothing is persisted yet. The next step sends these values through
  // trpc.admin.updateDeansMessage and loads the saved message instead of the mock.
  function onSubmit(values: DeansMessageValues) {
    form.reset(values);
    toast.success("Dean's message saved", {
      description: "This is a preview build, so the homepage has not changed yet.",
    });
  }

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

      <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="rounded-2xl shadow-2xs">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Message</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
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
                        <Textarea rows={10} placeholder="Write the Dean's welcome note." {...field} />
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
              </CardContent>
              <CardFooter className="justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!isDirty || isSubmitting}
                  onClick={() => form.reset(savedValues)}
                  className="h-9 rounded-xl px-4 text-xs"
                >
                  <RotateCcw className="size-3.5" />
                  Reset
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="h-9 rounded-xl px-5 text-xs"
                >
                  {isSubmitting ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Save className="size-3.5" />
                  )}
                  {isSubmitting ? "Saving..." : "Save message"}
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
    </div>
  );
}
