"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { opportunityTypes } from "@/lib/enums";
import { opportunityTypeLabels } from "@/lib/format";
import { textToRichTextDoc } from "@/lib/richtext";
import { trpc } from "@/lib/trpc/client";

const opportunitySchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters.").max(255),
  orgName: z.string().trim().min(2, "Enter the organization name.").max(128),
  orgUrl: z
    .string()
    .trim()
    .refine(
      (value) => !value || z.httpUrl().safeParse(value).success,
      "Enter a full URL starting with https://.",
    ),
  type: z.enum(opportunityTypes),
  location: z.string().trim().min(2, "Enter a location.").max(128),
  applyUrl: z.string().trim().pipe(z.httpUrl("Enter a full URL starting with https://.")),
  deadline: z.string(),
  description: z.string().trim().min(1, "Add eligibility and role details."),
});

type OpportunityValues = z.output<typeof opportunitySchema>;

export default function SubmitOpportunityPage() {
  const router = useRouter();
  const utils = trpc.useUtils();

  const form = useForm({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      title: "",
      orgName: "",
      orgUrl: "",
      type: "siwes_it",
      location: "",
      applyUrl: "",
      deadline: "",
      description: "",
    } satisfies z.input<typeof opportunitySchema>,
  });

  const submitMutation = trpc.opportunity.submit.useMutation({
    onSuccess: (res) => {
      utils.opportunity.mySubmissions.invalidate();
      utils.user.getDashboardStats.invalidate();
      toast.success(`"${res.title}" saved.`);
      router.push("/dashboard/opportunities");
    },
    onError: (err) => toast.error(err.message),
  });

  function submit(values: OpportunityValues, saveAsDraft: boolean) {
    submitMutation.mutate({
      title: values.title,
      orgName: values.orgName,
      orgUrl: values.orgUrl || undefined,
      type: values.type,
      location: values.location,
      descriptionJson: textToRichTextDoc(values.description),
      applyUrl: values.applyUrl,
      deadline: values.deadline ? new Date(values.deadline).toISOString() : undefined,
      saveAsDraft,
    });
  }

  const isSubmitting = submitMutation.isPending;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href="/dashboard/opportunities"
          className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Opportunities
        </Link>
        <DashboardHeader title="Post Opportunity" />
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => submit(values, false))}
          className="mx-auto w-full max-w-3xl"
        >
          <Card className="rounded-2xl shadow-2xs">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Opportunity Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 2026 SIWES Internship Placement" maxLength={255} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid items-start gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="orgName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Organization</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Acme Technologies" maxLength={128} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="orgUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Website (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://company.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Type</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="h-9 w-full rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {opportunityTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {opportunityTypeLabels[type]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Uyo, or Remote" maxLength={128} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="applyUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Application link</FormLabel>
                      <FormControl>
                        <Input type="url" placeholder="https://apply.company.com/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Deadline (optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Details & Eligibility</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        placeholder="Role overview, eligibility, duration, and stipend..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                className="h-9 w-full rounded-xl px-4 text-xs sm:w-auto"
                onClick={form.handleSubmit((values) => submit(values, true))}
              >
                Save Draft
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="h-9 w-full rounded-xl px-4 text-xs sm:w-auto"
              >
                {isSubmitting ? <Loader2 className="size-3.5 animate-spin" /> : null}
                {isSubmitting ? "Submitting..." : "Submit for Review"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
