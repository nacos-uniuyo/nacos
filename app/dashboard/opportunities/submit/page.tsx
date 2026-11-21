"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  Globe,
  Link as LinkIcon,
  MapPin,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { opportunityTypes, type OpportunityType } from "@/lib/enums";
import { textToRichTextDoc } from "@/lib/richtext";
import { trpc } from "@/lib/trpc/client";

export default function SubmitOpportunityPage() {
  const router = useRouter();
  const utils = trpc.useUtils();

  const [title, setTitle] = useState("");
  const [orgName, setOrgName] = useState("");
  const [orgUrl, setOrgUrl] = useState("");
  const [type, setType] = useState<OpportunityType>("siwes_it");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [applyUrl, setApplyUrl] = useState("");
  const [deadline, setDeadline] = useState("");

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const submitMutation = trpc.opportunity.submit.useMutation({
    onSuccess: (res) => {
      utils.opportunity.mySubmissions.invalidate();
      utils.user.getDashboardStats.invalidate();
      setFeedback({
        type: "success",
        message: `Opportunity "${res.title}" submitted successfully for review!`,
      });
      setTimeout(() => {
        router.push("/dashboard/opportunities");
      }, 1500);
    },
    onError: (err) => {
      setFeedback({
        type: "error",
        message: err.message || "Failed to submit opportunity. Please check fields.",
      });
    },
  });

  async function handleSubmit(saveAsDraft: boolean) {
    setFeedback(null);

    if (!title.trim() || title.length < 3) {
      setFeedback({ type: "error", message: "Title must be at least 3 characters." });
      return;
    }
    if (!orgName.trim()) {
      setFeedback({ type: "error", message: "Organization name is required." });
      return;
    }
    if (!location.trim()) {
      setFeedback({ type: "error", message: "Location is required (e.g., Uyo, Remote, Hybrid)." });
      return;
    }
    if (!applyUrl.trim() || !applyUrl.startsWith("http")) {
      setFeedback({ type: "error", message: "A valid application URL starting with https:// is required." });
      return;
    }
    if (!description.trim()) {
      setFeedback({ type: "error", message: "Please provide details and eligibility criteria." });
      return;
    }

    submitMutation.mutate({
      title: title.trim(),
      orgName: orgName.trim(),
      orgUrl: orgUrl.trim() || undefined,
      type,
      location: location.trim(),
      descriptionJson: textToRichTextDoc(description.trim()),
      applyUrl: applyUrl.trim(),
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
      saveAsDraft,
    });
  }

  const isSubmitting = submitMutation.isPending;

  return (
    <div className="space-y-6">
      <DashboardHeader
        breadcrumbs={[
          { label: "Opportunities", href: "/dashboard/opportunities" },
          { label: "Submit" },
        ]}
        title="Post an Opportunity"
        description="Share SIWES attachments, industrial internships, scholarships, and junior software vacancies."
      />

      {feedback && (
        <div
          className={`flex items-center gap-3 rounded-xl p-4 text-sm font-medium ${
            feedback.type === "success"
              ? "border border-emerald-300 bg-emerald-50 text-emerald-900"
              : "border border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="size-5 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="mx-auto max-w-3xl">
        <Card className="border-[var(--rule)] bg-white/80 shadow-xs">
          <CardHeader className="border-b border-[var(--rule)] pb-4">
            <CardTitle className="text-base font-bold text-[var(--ink)]">
              Opportunity Details
            </CardTitle>
            <CardDescription className="text-xs">
              Provide complete application details so students can prepare necessary credentials.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-5">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-sm font-semibold">
                Opportunity Title *
              </Label>
              <Input
                id="title"
                placeholder="e.g. 2026 Shell / NNPC IT & SIWES Internship Placement"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={255}
                required
              />
            </div>

            {/* Organization & Website */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="orgName" className="text-sm font-semibold">
                  Hiring Organization / Company *
                </Label>
                <div className="relative">
                  <Input
                    id="orgName"
                    placeholder="e.g. Shell Nigeria"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    required
                    className="pl-8"
                  />
                  <Building2 className="pointer-events-none absolute left-2.5 top-2.5 size-3.5 text-[var(--muted)]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="orgUrl" className="text-sm font-semibold">
                  Company Website (Optional)
                </Label>
                <div className="relative">
                  <Input
                    id="orgUrl"
                    placeholder="https://company.com"
                    value={orgUrl}
                    onChange={(e) => setOrgUrl(e.target.value)}
                    className="pl-8"
                  />
                  <Globe className="pointer-events-none absolute left-2.5 top-2.5 size-3.5 text-[var(--muted)]" />
                </div>
              </div>
            </div>

            {/* Type & Location */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="type" className="text-sm font-semibold">
                  Opportunity Type *
                </Label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value as OpportunityType)}
                  className="flex h-9 w-full rounded-md border border-[var(--rule)] bg-white px-3 py-1 text-sm shadow-xs outline-none"
                >
                  {opportunityTypes.map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, " ").toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="location" className="text-sm font-semibold">
                  Location *
                </Label>
                <div className="relative">
                  <Input
                    id="location"
                    placeholder="e.g. Uyo, Akwa Ibom (or Remote)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    className="pl-8"
                  />
                  <MapPin className="pointer-events-none absolute left-2.5 top-2.5 size-3.5 text-[var(--muted)]" />
                </div>
              </div>
            </div>

            {/* Application URL & Deadline */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="applyUrl" className="text-sm font-semibold">
                  Application Link / Form URL *
                </Label>
                <div className="relative">
                  <Input
                    id="applyUrl"
                    type="url"
                    placeholder="https://apply.company.com/…"
                    value={applyUrl}
                    onChange={(e) => setApplyUrl(e.target.value)}
                    required
                    className="pl-8"
                  />
                  <LinkIcon className="pointer-events-none absolute left-2.5 top-2.5 size-3.5 text-[var(--muted)]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="deadline" className="text-sm font-semibold">
                  Application Deadline
                </Label>
                <div className="relative">
                  <Input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="pl-8"
                  />
                  <Calendar className="pointer-events-none absolute left-2.5 top-2.5 size-3.5 text-[var(--muted)]" />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-sm font-semibold">
                Opportunity Description & Requirements *
              </Label>
              <Textarea
                id="description"
                placeholder="Outline duties, required student credentials (ND, HND, BSc), SIWES duration, stipend details…"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-2.5 border-t border-[var(--rule)] bg-[var(--sand)]/20 px-6 py-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => handleSubmit(true)}
              className="w-full border-[var(--rule)] sm:w-auto"
            >
              Save as Draft
            </Button>
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(false)}
              className="w-full bg-[var(--forest)] text-[var(--paper)] hover:bg-[var(--forest-2)] sm:w-auto"
            >
              {isSubmitting ? "Submitting Opportunity…" : "Post for Moderation"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
