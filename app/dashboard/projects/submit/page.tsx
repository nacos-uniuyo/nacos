"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useState } from "react";
import { Plus, Trash2, UploadCloud } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { projectCategories } from "@/lib/enums";
import { projectCategoryLabels } from "@/lib/format";
import { textToRichTextDoc } from "@/lib/richtext";
import { trpc } from "@/lib/trpc/client";
import { uploadImageToCloudinary } from "@/lib/upload";

const MAX_BANNER_BYTES = 5 * 1024 * 1024;
const NO_SESSION = "none";

const optionalUrl = z
  .string()
  .trim()
  .refine((value) => !value || z.httpUrl().safeParse(value).success, "Enter a full URL starting with https://.");

const projectSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters.").max(255),
  tagline: z.string().trim().min(5, "Tagline must be at least 5 characters.").max(255),
  description: z.string().trim().min(1, "Describe the project."),
  department: z.string().min(1, "Select your department."),
  session: z.string(),
  category: z.enum(projectCategories),
  courseCode: z.string().trim().max(32),
  groupNumber: z.string().refine((value) => {
    if (!value) return true;
    const group = Number(value);
    return Number.isInteger(group) && group >= 1 && group <= 50;
  }, "Enter a group number from 1 to 50."),
  teamDisplayName: z.string().trim().max(128),
  contributors: z.array(z.object({ name: z.string().trim().max(128), role: z.string().trim().max(128) })),
  repoUrl: optionalUrl,
  demoUrl: optionalUrl,
});

type ProjectValues = z.output<typeof projectSchema>;

export default function SubmitProjectPage() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data: departments } = trpc.department.list.useQuery();
  const { data: sessions } = trpc.session.list.useQuery();

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerUploading, setBannerUploading] = useState(false);

  useEffect(() => {
    if (!bannerFile) {
      setBannerPreview(null);
      return;
    }
    const url = URL.createObjectURL(bannerFile);
    setBannerPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [bannerFile]);

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
      groupNumber: "",
      teamDisplayName: "",
      contributors: [{ name: "", role: "Lead Developer" }],
      repoUrl: "",
      demoUrl: "",
    } satisfies z.input<typeof projectSchema>,
  });

  const contributors = useFieldArray({ control: form.control, name: "contributors" });

  const submitMutation = trpc.project.submit.useMutation({
    onSuccess: (res) => {
      utils.project.mySubmissions.invalidate();
      utils.user.getDashboardStats.invalidate();
      toast.success(`"${res.title}" has been saved.`);
      router.push("/dashboard/projects");
    },
    onError: (err) => toast.error(err.message),
  });

  async function submit(values: ProjectValues, saveAsDraft: boolean) {
    let banner: Awaited<ReturnType<typeof uploadImageToCloudinary>> | undefined;

    if (bannerFile) {
      setBannerUploading(true);
      try {
        banner = await uploadImageToCloudinary(bannerFile);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Image upload failed. Try again.");
        return;
      } finally {
        setBannerUploading(false);
      }
    }

    submitMutation.mutate({
      title: values.title,
      tagline: values.tagline,
      descriptionJson: textToRichTextDoc(values.description),
      departmentId: values.department,
      sessionId: values.session === NO_SESSION ? undefined : values.session,
      category: values.category,
      courseCode: values.courseCode || undefined,
      cohortGroupNumber: values.groupNumber ? Number(values.groupNumber) : undefined,
      teamDisplayName: values.teamDisplayName || undefined,
      leadContributors: values.contributors
        .filter((person) => person.name)
        .map((person) => ({ name: person.name, role: person.role || undefined })),
      bannerUrl: banner?.secureUrl,
      bannerPublicId: banner?.publicId,
      repoUrl: values.repoUrl || undefined,
      demoUrl: values.demoUrl || undefined,
      saveAsDraft,
    });
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

  const isSubmitting = submitMutation.isPending || bannerUploading;

  return (
    <div className="space-y-6">
      <DashboardHeader
        breadcrumbs={[{ label: "Projects", href: "/dashboard/projects" }, { label: "Submit" }]}
        title="Submit a Project"
        description="Send coursework, group projects or personal builds for coordinator review."
      />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => submit(values, false))}
          className="grid items-start gap-6 lg:grid-cols-[1fr_340px]"
        >
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project information</CardTitle>
                <CardDescription>What the project is and what it does.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project title</FormLabel>
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
                      <FormLabel>Tagline</FormLabel>
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={6}
                          placeholder="Describe the problem, the architecture and the tools you used. Leave a blank line between paragraphs."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Academic context</CardTitle>
                <CardDescription>Where this work belongs in your programme.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid items-start gap-5 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full">
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
                        <FormLabel>Academic session</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full">
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
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
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
                <div className="grid items-start gap-5 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="courseCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course code</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. CSC 411" maxLength={32} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="groupNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Group number</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} max={50} placeholder="e.g. 4" {...field} />
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
                        <FormLabel>Team name</FormLabel>
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

            <Card>
              <CardHeader>
                <CardTitle>Team</CardTitle>
                <CardDescription>Students who worked on this project.</CardDescription>
                <CardAction>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => contributors.append({ name: "", role: "Contributor" })}
                  >
                    <Plus />
                    Add member
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent className="space-y-3">
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
                        size="icon"
                        aria-label={`Remove member ${index + 1}`}
                        onClick={() => contributors.remove(index)}
                      >
                        <Trash2 />
                      </Button>
                    ) : null}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 lg:sticky lg:top-6">
            <Card>
              <CardHeader>
                <CardTitle>Cover image</CardTitle>
                <CardDescription>PNG, JPG or WEBP, up to 5MB.</CardDescription>
              </CardHeader>
              <CardContent>
                {bannerPreview ? (
                  <div className="relative aspect-video overflow-hidden rounded-lg border">
                    <Image src={bannerPreview} alt="Selected cover" fill unoptimized className="object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-sm"
                      aria-label="Remove cover image"
                      className="absolute top-2 right-2"
                      onClick={() => setBannerFile(null)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ) : (
                  <label className="flex aspect-video cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                    <UploadCloud className="size-6" />
                    Upload image
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

            <Card>
              <CardHeader>
                <CardTitle>Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <FormField
                  control={form.control}
                  name="repoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source repository</FormLabel>
                      <FormControl>
                        <Input placeholder="https://github.com/…" {...field} />
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
                      <FormLabel>Live demo or video</FormLabel>
                      <FormControl>
                        <Input placeholder="https://…" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="grid gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting…" : "Submit for review"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={form.handleSubmit((values) => submit(values, true))}
              >
                Save as draft
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
