"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { Suspense, useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ErrorState, ListSkeleton } from "@/components/dashboard/DashboardStates";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useDashboardSession } from "@/lib/auth-client";
import { projectCategories } from "@/lib/enums";
import { projectCategoryLabels } from "@/lib/format";
import { richTextDocToText, textToRichTextDoc } from "@/lib/richtext";
import { trpc } from "@/lib/trpc/client";
import { uploadImageToCloudinary } from "@/lib/upload";

const MAX_BANNER_BYTES = 5 * 1024 * 1024;
const NO_SESSION = "none";

const optionalUrl = z
  .string()
  .trim()
  .refine(
    (value) => !value || z.httpUrl().safeParse(value).success,
    "Enter a full URL starting with https://.",
  );

const projectSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters.").max(255),
  tagline: z.string().trim().min(5, "Tagline must be at least 5 characters.").max(255),
  description: z.string().trim().min(1, "Describe the project."),
  department: z.string().min(1, "Select your department."),
  session: z.string(),
  category: z.enum(projectCategories),
  courseCode: z.string().trim().max(32),
  teamDisplayName: z.string().trim().max(128),
  contributors: z.array(
    z.object({ name: z.string().trim().max(128), role: z.string().trim().max(128) }),
  ),
  repoUrl: optionalUrl,
  demoUrl: optionalUrl,
});

type ProjectValues = z.output<typeof projectSchema>;

function SubmitProjectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const { isAuthenticated } = useDashboardSession();
  const utils = trpc.useUtils();

  const { data: departments } = trpc.department.list.useQuery();
  const { data: sessions } = trpc.session.list.useQuery();
  const {
    data: existing,
    isLoading: loadingExisting,
    error: existingError,
  } = trpc.project.getMySubmission.useQuery(
    { id: editId ?? "" },
    { enabled: Boolean(editId) },
  );

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [existingBannerUrl, setExistingBannerUrl] = useState<string | null>(null);
  const [existingBannerPublicId, setExistingBannerPublicId] = useState<string | null>(null);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [memberPickerOpen, setMemberPickerOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const { data: memberResults, isFetching: searchingMembers } = trpc.user.searchMembers.useQuery(
    { query: memberSearch },
    { enabled: isAuthenticated && memberPickerOpen },
  );

  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      tagline: "",
      description: "",
      department: "",
      session: NO_SESSION,
      category: "software_engineering",
      courseCode: "",
      teamDisplayName: "",
      contributors: [{ name: "", role: "Lead Developer" }],
      repoUrl: "",
      demoUrl: "",
    } satisfies z.input<typeof projectSchema>,
    values: existing
      ? {
          title: existing.title,
          tagline: existing.tagline,
          description: existing.descriptionJson
            ? richTextDocToText(existing.descriptionJson)
            : "",
          department: existing.departmentSlug ?? existing.departmentId,
          session: existing.sessionSlug ?? NO_SESSION,
          category: existing.category,
          courseCode: existing.courseCode ?? "",
          teamDisplayName: existing.teamDisplayName ?? "",
          contributors:
            existing.leadContributors.length > 0
              ? existing.leadContributors.map((c) => ({
                  name: c.name,
                  role: c.role ?? "Contributor",
                }))
              : [{ name: "", role: "Lead Developer" }],
          repoUrl: existing.repoUrl ?? "",
          demoUrl: existing.demoUrl ?? "",
        }
      : undefined,
  });

  useEffect(() => {
    if (existing) {
      setExistingBannerUrl(existing.bannerUrl ?? null);
      setExistingBannerPublicId(existing.bannerPublicId ?? null);
    }
  }, [existing]);

  useEffect(() => {
    if (!bannerFile) {
      setBannerPreview(null);
      return;
    }
    const url = URL.createObjectURL(bannerFile);
    setBannerPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [bannerFile]);

  const contributors = useFieldArray({ control: form.control, name: "contributors" });

  function addContributorName(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    const current = form.getValues("contributors");
    const emptyIdx = current.findIndex((c) => !c.name.trim());
    if (emptyIdx !== -1) {
      form.setValue(`contributors.${emptyIdx}.name`, trimmed);
    } else {
      contributors.append({ name: trimmed, role: "Contributor" });
    }
    setMemberPickerOpen(false);
    setMemberSearch("");
    setHighlightedIndex(0);
  }

  const submitMutation = trpc.project.submit.useMutation({
    onSuccess: (res) => {
      utils.project.mySubmissions.invalidate();
      utils.user.getDashboardStats.invalidate();
      toast.success(`"${res.title}" saved.`);
      router.push("/dashboard/projects");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.project.updateMySubmission.useMutation({
    onSuccess: (res) => {
      utils.project.mySubmissions.invalidate();
      utils.user.getDashboardStats.invalidate();
      toast.success(`"${res.title}" updated.`);
      router.push("/dashboard/projects");
    },
    onError: (err) => toast.error(err.message),
  });

  async function submit(values: ProjectValues, saveAsDraft: boolean) {
    let bannerUrl = existingBannerUrl;
    let bannerPublicId = existingBannerPublicId;

    if (bannerFile) {
      setBannerUploading(true);
      try {
        const uploaded = await uploadImageToCloudinary(bannerFile);
        bannerUrl = uploaded.secureUrl;
        bannerPublicId = uploaded.publicId;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Image upload failed.");
        return;
      } finally {
        setBannerUploading(false);
      }
    }

    const payload = {
      title: values.title,
      tagline: values.tagline,
      descriptionJson: textToRichTextDoc(values.description),
      departmentId: values.department,
      sessionId: values.session === NO_SESSION ? undefined : values.session,
      category: values.category,
      courseCode: values.courseCode || undefined,
      teamDisplayName: values.teamDisplayName || undefined,
      leadContributors: values.contributors
        .filter((person) => person.name)
        .map((person) => ({ name: person.name, role: person.role || undefined })),
      bannerUrl: bannerUrl || undefined,
      bannerPublicId: bannerPublicId || undefined,
      repoUrl: values.repoUrl || undefined,
      demoUrl: values.demoUrl || undefined,
    };

    if (editId && existing) {
      updateMutation.mutate({
        id: existing.id,
        ...payload,
        submitForReview: !saveAsDraft,
      });
    } else {
      submitMutation.mutate({
        ...payload,
        saveAsDraft,
      });
    }
  }

  function handleBannerSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > MAX_BANNER_BYTES) {
      toast.error("Banner images must be 5MB or smaller.");
      return;
    }
    setBannerFile(file);
  }

  if (editId && (!isAuthenticated || loadingExisting)) {
    return <ListSkeleton count={3} />;
  }

  if (editId && existingError) {
    return <ErrorState title="Could not load project" message={existingError.message} />;
  }

  const isSubmitting = submitMutation.isPending || updateMutation.isPending || bannerUploading;
  const activePreview = bannerPreview ?? existingBannerUrl;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href="/dashboard/projects"
          className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Projects
        </Link>
        <DashboardHeader title={editId ? "Edit Project" : "Submit Project"} />
      </div>

      {existing?.status === "rejected" && existing.rejectionReason ? (
        <Alert variant="destructive" className="rounded-2xl">
          <AlertCircle />
          <AlertTitle>Coordinator feedback</AlertTitle>
          <AlertDescription>{existing.rejectionReason}</AlertDescription>
        </Alert>
      ) : null}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => submit(values, false))}
          className="grid items-start gap-6 lg:grid-cols-[1fr_340px]"
        >
          <div className="flex flex-col gap-6">
            <Card className="rounded-2xl shadow-2xs">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Project Details</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. UNIUYO Attendance Portal" maxLength={255} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tagline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Tagline</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. RFID-based student verification" maxLength={255} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Description</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={6}
                          placeholder="Problem, architecture, and tools used..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-2xs">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Academic Context</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid items-start gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Department</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="h-9 w-full rounded-xl">
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {departments?.map((dept) => (
                              <SelectItem key={dept.slug} value={dept.slug}>
                                {dept.name} ({dept.shortName})
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
                    name="session"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Session</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="h-9 w-full rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={NO_SESSION}>Not specified</SelectItem>
                            {sessions?.map((session) => (
                              <SelectItem key={session.slug} value={session.slug}>
                                {session.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid items-start gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-1">
                        <FormLabel className="text-xs">Category</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="h-9 w-full rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {projectCategories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {projectCategoryLabels[category]}
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
                    name="courseCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Course code</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. CSC 411" maxLength={32} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="teamDisplayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Team name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Group 4" maxLength={128} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-2xs">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Team Members</CardTitle>
                <CardAction>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setMemberPickerOpen(true)}
                    className="h-8 rounded-xl px-3 text-xs"
                  >
                    <Plus className="size-3.5" />
                    Add
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {contributors.fields.map((contributor, index) => (
                  <div key={contributor.id} className="flex flex-col gap-2 sm:flex-row sm:items-start">
                    <FormField
                      control={form.control}
                      name={`contributors.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className="sr-only">Member {index + 1} name</FormLabel>
                          <FormControl>
                            <Input placeholder="Student name" maxLength={128} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`contributors.${index}.role`}
                      render={({ field }) => (
                        <FormItem className="sm:w-44">
                          <FormLabel className="sr-only">Member {index + 1} role</FormLabel>
                          <FormControl>
                            <Input placeholder="Role" maxLength={128} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {contributors.fields.length > 1 ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label={`Remove member ${index + 1}`}
                        onClick={() => contributors.remove(index)}
                        className="size-9 rounded-xl"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    ) : null}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-5 lg:sticky lg:top-24">
            <Card className="rounded-2xl shadow-2xs">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Cover Image</CardTitle>
              </CardHeader>
              <CardContent>
                {activePreview ? (
                  <div className="relative aspect-video overflow-hidden rounded-xl border">
                    <Image
                      src={activePreview}
                      alt="Selected cover"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-sm"
                      aria-label="Remove cover image"
                      className="absolute right-2 top-2 size-8 rounded-lg"
                      onClick={() => {
                        setBannerFile(null);
                        setExistingBannerUrl(null);
                        setExistingBannerPublicId(null);
                      }}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex aspect-video cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/50 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    <UploadCloud className="size-6" />
                    <span>PNG, JPG or WEBP (max 5MB)</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleBannerSelect}
                      className="sr-only"
                    />
                  </label>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-2xs">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Links</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="repoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Repository</FormLabel>
                      <FormControl>
                        <Input placeholder="https://github.com/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="demoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Live demo</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="grid gap-2.5">
              <Button type="submit" disabled={isSubmitting} className="h-10 rounded-xl text-xs">
                {isSubmitting ? <Loader2 className="size-3.5 animate-spin" /> : null}
                {isSubmitting ? "Submitting..." : editId ? "Save & Submit" : "Submit for Review"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={form.handleSubmit((values) => submit(values, true))}
                className="h-10 rounded-xl text-xs"
              >
                Save Draft
              </Button>
            </div>
          </div>
        </form>
      </Form>

      <Dialog open={memberPickerOpen} onOpenChange={setMemberPickerOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Add Member</DialogTitle>
            <DialogDescription className="text-xs">
              Search by name, email, or registration number.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Input
              value={memberSearch}
              onChange={(e) => {
                setMemberSearch(e.target.value);
                setHighlightedIndex(0);
              }}
              onKeyDown={(e) => {
                const count = memberResults?.length ?? 0;
                if (e.key === "ArrowDown" && count > 0) {
                  e.preventDefault();
                  setHighlightedIndex((prev) => (prev + 1) % count);
                } else if (e.key === "ArrowUp" && count > 0) {
                  e.preventDefault();
                  setHighlightedIndex((prev) => (prev - 1 + count) % count);
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  const selected = memberResults?.[highlightedIndex];
                  if (selected) {
                    addContributorName(selected.name);
                  } else if (memberSearch.trim()) {
                    addContributorName(memberSearch);
                  }
                }
              }}
              placeholder="Search members or type a name..."
              autoFocus
            />
            <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
              {searchingMembers ? (
                <p className="py-6 text-center text-xs text-muted-foreground">Searching...</p>
              ) : !memberResults?.length ? (
                <p className="py-4 text-center text-xs text-muted-foreground">No members found.</p>
              ) : (
                memberResults.map((member, index) => {
                  const initials =
                    member.name
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((p) => p[0]?.toUpperCase() ?? "")
                      .join("") || "U";
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onClick={() => addContributorName(member.name)}
                      className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors ${
                        index === highlightedIndex ? "bg-accent" : "hover:bg-accent"
                      }`}
                    >
                      <Avatar className="size-8">
                        {member.image ? <AvatarImage src={member.image} alt={member.name} /> : null}
                        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{member.name}</p>
                        {member.regNumber ? (
                          <p className="truncate font-mono text-xs text-muted-foreground">
                            {member.regNumber}
                          </p>
                        ) : null}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            <Button
              type="button"
              variant="secondary"
              className="h-9 w-full rounded-xl text-xs"
              onClick={() => addContributorName(memberSearch)}
            >
              <Plus className="size-3.5" />
              {memberSearch.trim() ? `Add "${memberSearch.trim()}"` : "Add custom member"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function SubmitProjectPage() {
  return (
    <Suspense fallback={<ListSkeleton count={3} />}>
      <SubmitProjectContent />
    </Suspense>
  );
}
