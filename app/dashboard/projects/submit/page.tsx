"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FolderGit2,
  Globe,
  Plus,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { projectCategories, type ProjectCategory } from "@/lib/enums";
import { textToRichTextDoc } from "@/lib/richtext";
import { trpc } from "@/lib/trpc/client";
import { uploadImageToCloudinary } from "@/lib/upload";

type Contributor = {
  name: string;
  role?: string;
  github?: string;
  linkedin?: string;
};

export default function SubmitProjectPage() {
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: departments } = trpc.department.list.useQuery();
  const { data: sessions } = trpc.session.list.useQuery();

  // Form State
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [category, setCategory] = useState<ProjectCategory>("software_engineering");
  const [courseCode, setCourseCode] = useState("");
  const [cohortGroupNumber, setCohortGroupNumber] = useState<string>("");
  const [teamDisplayName, setTeamDisplayName] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");

  // Media upload state
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerUploading, setBannerUploading] = useState(false);

  // Contributors state
  const [contributors, setContributors] = useState<Contributor[]>([
    { name: "", role: "Lead Developer" },
  ]);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const submitMutation = trpc.project.submit.useMutation({
    onSuccess: (res) => {
      utils.project.mySubmissions.invalidate();
      utils.user.getDashboardStats.invalidate();
      setFeedback({
        type: "success",
        message: `Project proposal "${res.title}" successfully submitted! Redirecting…`,
      });
      setTimeout(() => {
        router.push("/dashboard/projects");
      }, 1500);
    },
    onError: (err) => {
      setFeedback({
        type: "error",
        message: err.message || "Failed to submit project proposal. Please check fields.",
      });
    },
  });

  const handleBannerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const addContributor = () => {
    setContributors([...contributors, { name: "", role: "Contributor" }]);
  };

  const removeContributor = (index: number) => {
    setContributors(contributors.filter((_, i) => i !== index));
  };

  const updateContributor = (index: number, field: keyof Contributor, val: string) => {
    const next = [...contributors];
    next[index] = { ...next[index], [field]: val };
    setContributors(next);
  };

  async function handleSubmit(saveAsDraft: boolean) {
    setFeedback(null);

    if (!title.trim() || title.length < 3) {
      setFeedback({ type: "error", message: "Title must be at least 3 characters long." });
      return;
    }
    if (!tagline.trim() || tagline.length < 5) {
      setFeedback({ type: "error", message: "Tagline must be at least 5 characters long." });
      return;
    }
    if (!description.trim()) {
      setFeedback({ type: "error", message: "Please provide a description of the project." });
      return;
    }
    if (!departmentId) {
      setFeedback({ type: "error", message: "Please select your academic department." });
      return;
    }

    let uploadedBannerUrl: string | undefined = undefined;
    let uploadedBannerPublicId: string | undefined = undefined;

    // Upload banner if selected
    if (bannerFile) {
      try {
        setBannerUploading(true);
        const uploaded = await uploadImageToCloudinary(bannerFile);
        uploadedBannerUrl = uploaded.secureUrl;
        uploadedBannerPublicId = uploaded.publicId;
      } catch (err: any) {
        setBannerUploading(false);
        setFeedback({
          type: "error",
          message: err.message || "Image upload failed. Please try again or submit without image.",
        });
        return;
      } finally {
        setBannerUploading(false);
      }
    }

    // Filter valid contributors
    const validContributors = contributors
      .filter((c) => c.name.trim().length > 0)
      .map((c) => ({
        name: c.name.trim(),
        role: c.role?.trim() || undefined,
        github: c.github?.trim() || undefined,
        linkedin: c.linkedin?.trim() || undefined,
      }));

    submitMutation.mutate({
      title: title.trim(),
      tagline: tagline.trim(),
      descriptionJson: textToRichTextDoc(description.trim()),
      departmentId,
      sessionId: sessionId || undefined,
      category,
      courseCode: courseCode.trim() || undefined,
      cohortGroupNumber: cohortGroupNumber ? parseInt(cohortGroupNumber, 10) : undefined,
      teamDisplayName: teamDisplayName.trim() || undefined,
      leadContributors: validContributors,
      bannerUrl: uploadedBannerUrl,
      bannerPublicId: uploadedBannerPublicId,
      repoUrl: repoUrl.trim() || undefined,
      demoUrl: demoUrl.trim() || undefined,
      saveAsDraft,
    });
  }

  const isSubmitting = submitMutation.isPending || bannerUploading;

  return (
    <div className="space-y-6">
      <DashboardHeader
        breadcrumbs={[
          { label: "Projects", href: "/dashboard/projects" },
          { label: "Submit" },
        ]}
        title="Submit Project Proposal"
        description="Submit coursework assignments, group projects, or personal software builds for coordinator review."
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

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* Main Project Details */}
        <div className="space-y-6">
          {/* Core Information */}
          <Card className="border-[var(--rule)] bg-white/80 shadow-xs">
            <CardHeader className="border-b border-[var(--rule)] pb-4">
              <CardTitle className="text-base font-bold text-[var(--ink)]">
                1. Project Information
              </CardTitle>
              <CardDescription className="text-xs">
                Title, tagline, and comprehensive description of the software.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-sm font-semibold">
                  Project Title *
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. Uniuyo Attendance & Biometrics Portal"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={255}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tagline" className="text-sm font-semibold">
                  Tagline / Short Summary *
                </Label>
                <Input
                  id="tagline"
                  placeholder="e.g. RFID-based automated student verification system"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  maxLength={255}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-sm font-semibold">
                  Detailed Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the architecture, problem solved, implementation tools, and workflow…"
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
                <p className="text-[0.72rem] text-[var(--muted)]">
                  Formatted automatically into structured TipTap content for the showcase gallery.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Academic Context */}
          <Card className="border-[var(--rule)] bg-white/80 shadow-xs">
            <CardHeader className="border-b border-[var(--rule)] pb-4">
              <CardTitle className="text-base font-bold text-[var(--ink)]">
                2. Academic & Coursework Context
              </CardTitle>
              <CardDescription className="text-xs">
                Coursework group assignments (Group 1 - 10) or independent research.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="departmentId" className="text-sm font-semibold">
                    Department *
                  </Label>
                  <select
                    id="departmentId"
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-[var(--rule)] bg-white px-3 py-1 text-sm shadow-xs outline-none"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments?.map((dept) => (
                      <option key={dept.slug} value={dept.slug}>
                        {dept.name} ({dept.shortName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="sessionId" className="text-sm font-semibold">
                    Academic Session
                  </Label>
                  <select
                    id="sessionId"
                    value={sessionId}
                    onChange={(e) => setSessionId(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-[var(--rule)] bg-white px-3 py-1 text-sm shadow-xs outline-none"
                  >
                    <option value="">Select Session (Optional)</option>
                    {sessions?.map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-sm font-semibold">
                    Category *
                  </Label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                    className="flex h-9 w-full rounded-md border border-[var(--rule)] bg-white px-3 py-1 text-sm shadow-xs outline-none"
                  >
                    {projectCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="courseCode" className="text-sm font-semibold">
                    Course Code
                  </Label>
                  <Input
                    id="courseCode"
                    placeholder="e.g. CSC 411"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    maxLength={32}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="groupNumber" className="text-sm font-semibold">
                    Cohort Group #
                  </Label>
                  <Input
                    id="groupNumber"
                    type="number"
                    min="1"
                    max="50"
                    placeholder="e.g. 4"
                    value={cohortGroupNumber}
                    onChange={(e) => setCohortGroupNumber(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="teamDisplayName" className="text-sm font-semibold">
                  Team Display Name
                </Label>
                <Input
                  id="teamDisplayName"
                  placeholder="e.g. CSC 400L - Group 4 (Alpha Build)"
                  value={teamDisplayName}
                  onChange={(e) => setTeamDisplayName(e.target.value)}
                  maxLength={128}
                />
              </div>
            </CardContent>
          </Card>

          {/* Lead Contributors */}
          <Card className="border-[var(--rule)] bg-white/80 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between border-b border-[var(--rule)] pb-4">
              <div>
                <CardTitle className="text-base font-bold text-[var(--ink)]">
                  3. Team & Lead Contributors
                </CardTitle>
                <CardDescription className="text-xs">
                  List students who co-authored this coursework build.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addContributor}
                className="gap-1 text-xs"
              >
                <Plus className="size-3.5" />
                Add Member
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {contributors.map((contrib, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-2 rounded-lg border border-[var(--rule)] bg-white p-3 sm:flex-row sm:items-center"
                >
                  <div className="flex-1">
                    <Input
                      placeholder="Student Name *"
                      value={contrib.name}
                      onChange={(e) => updateContributor(idx, "name", e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div className="w-full sm:w-40">
                    <Input
                      placeholder="Role (e.g. Backend)"
                      value={contrib.role ?? ""}
                      onChange={(e) => updateContributor(idx, "role", e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  {contributors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeContributor(idx)}
                      className="rounded p-1.5 text-[var(--muted)] hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Remove contributor"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Media & Links */}
        <div className="space-y-6">
          {/* Banner Media Card */}
          <Card className="border-[var(--rule)] bg-white/80 shadow-xs">
            <CardHeader className="border-b border-[var(--rule)] pb-4">
              <CardTitle className="text-sm font-bold text-[var(--ink)]">
                Project Cover / Banner
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {bannerPreview ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-[var(--rule)]">
                  <img
                    src={bannerPreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setBannerFile(null);
                      setBannerPreview(null);
                    }}
                    className="absolute right-2 top-2 rounded bg-black/70 p-1 text-white hover:bg-black"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[var(--rule)] bg-[var(--sand)]/30 hover:bg-[var(--sand)]/50">
                  <UploadCloud className="size-8 text-[var(--muted)]" />
                  <span className="mt-2 text-xs font-medium text-[var(--ink)]">
                    Upload banner image
                  </span>
                  <span className="text-[0.68rem] text-[var(--muted)]">
                    PNG, JPG, WEBP up to 5MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerSelect}
                    className="sr-only"
                  />
                </label>
              )}
            </CardContent>
          </Card>

          {/* Links */}
          <Card className="border-[var(--rule)] bg-white/80 shadow-xs">
            <CardHeader className="border-b border-[var(--rule)] pb-4">
              <CardTitle className="text-sm font-bold text-[var(--ink)]">
                Code & Demo Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <div className="space-y-1.5">
                <Label htmlFor="repoUrl" className="text-xs font-semibold">
                  Source Repository URL
                </Label>
                <div className="relative">
                  <Input
                    id="repoUrl"
                    placeholder="https://github.com/…"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    className="pl-8 text-xs"
                  />
                  <FolderGit2 className="pointer-events-none absolute left-2.5 top-2.5 size-3.5 text-[var(--muted)]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="demoUrl" className="text-xs font-semibold">
                  Live Demo / Video URL
                </Label>
                <div className="relative">
                  <Input
                    id="demoUrl"
                    placeholder="https://…"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    className="pl-8 text-xs"
                  />
                  <Globe className="pointer-events-none absolute left-2.5 top-2.5 size-3.5 text-[var(--muted)]" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Actions */}
          <div className="space-y-2.5">
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(false)}
              className="w-full bg-[var(--forest)] text-[var(--paper)] hover:bg-[var(--forest-2)]"
            >
              {isSubmitting ? "Submitting Proposal…" : "Submit for Coordinator Review"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => handleSubmit(true)}
              className="w-full border-[var(--rule)]"
            >
              Save as Draft
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
