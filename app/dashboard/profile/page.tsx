"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, GraduationCap, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ErrorState } from "@/components/dashboard/DashboardStates";
import { Badge } from "@/components/ui/badge";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { roleLabels } from "@/lib/format";
import { trpc } from "@/lib/trpc/client";

const NO_DEPARTMENT = "none";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(128),
  department: z.string(),
  regNumber: z.string().trim().max(32, "Registration number must not exceed 32 characters."),
});

const header = {
  breadcrumbs: [{ label: "Profile" }],
  title: "My Profile",
  description: "Manage your name, department and UNIUYO registration number.",
};

export default function ProfilePage() {
  const utils = trpc.useUtils();
  const { data: profile, isLoading, error } = trpc.user.getProfile.useQuery();
  const { data: departments } = trpc.department.list.useQuery();

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", department: NO_DEPARTMENT, regNumber: "" },
    values: profile
      ? {
          name: profile.name,
          department: profile.departmentSlug ?? NO_DEPARTMENT,
          regNumber: profile.regNumber ?? "",
        }
      : undefined,
  });

  const updateMutation = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Your profile has been saved.");
      utils.user.getProfile.invalidate();
      utils.user.getDashboardStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <DashboardHeader {...header} />
        <div className="mx-auto max-w-2xl space-y-4" aria-busy="true" aria-label="Loading">
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="space-y-6">
        <DashboardHeader {...header} />
        <ErrorState title="Could not load your profile" message="Refresh the page or sign in again." />
      </div>
    );
  }

  const departmentLocked = profile.role !== "user";

  return (
    <div className="space-y-6">
      <DashboardHeader {...header} />

      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="gap-1.5 py-1">
            <ShieldCheck className="size-3.5 text-muted-foreground" />
            {roleLabels[profile.role]}
          </Badge>
          <Badge variant="secondary" className="gap-1.5 py-1">
            <Building2 className="size-3.5 text-muted-foreground" />
            {profile.departmentName ?? "No department"}
          </Badge>
          <Badge variant="secondary" className="gap-1.5 py-1 font-mono">
            <GraduationCap className="size-3.5 text-muted-foreground" />
            {profile.regNumber || "No reg. number"}
          </Badge>
          {profile.claimedPerson ? (
            <Badge variant="outline" className="py-1">
              Yearbook: {profile.claimedPerson.fullName}
            </Badge>
          ) : null}
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) =>
              updateMutation.mutate({
                name: values.name,
                departmentId: values.department === NO_DEPARTMENT ? null : values.department,
                regNumber: values.regNumber || null,
              }),
            )}
          >
            <Card>
              <CardHeader>
                <CardTitle>Student information</CardTitle>
                <CardDescription>
                  Accurate details keep your coursework and SIWES records matched to you.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" value={profile.email} disabled readOnly />
                  <p className="text-sm text-muted-foreground">Your email comes from your Google account.</p>
                </div>

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange} disabled={departmentLocked}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select your department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={NO_DEPARTMENT}>No department</SelectItem>
                          {departments?.map((dept) => (
                            <SelectItem key={dept.slug} value={dept.slug}>
                              {dept.name} ({dept.shortName})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {departmentLocked
                          ? "Your department is assigned by a faculty administrator."
                          : "This department reviews your coursework proposals."}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="regNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UNIUYO registration number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. 22/SC/CO/1199"
                          maxLength={32}
                          {...field}
                          onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="justify-end">
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Saving…" : "Save changes"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
}
