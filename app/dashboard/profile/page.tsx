"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, GraduationCap, Loader2, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ErrorState } from "@/components/dashboard/DashboardStates";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
      toast.success("Profile saved.");
      utils.user.getProfile.invalidate();
      utils.user.getDashboardStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <DashboardHeader title="Account" />
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5" aria-busy="true" aria-label="Loading">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col gap-6">
        <DashboardHeader title="Account" />
        <ErrorState title="Could not load your profile" message="Refresh the page or sign in again." />
      </div>
    );
  }

  const departmentLocked = profile.role !== "user";
  const initials =
    profile.name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "U";

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader title="Account" />

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
        <Card className="rounded-2xl py-5 shadow-2xs">
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="size-14">
                {profile.image ? <AvatarImage src={profile.image} alt={profile.name} /> : null}
                <AvatarFallback className="bg-primary/12 text-base font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-foreground">{profile.name}</h2>
                <p className="truncate text-xs text-muted-foreground">{profile.email}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="gap-1.5 rounded-full py-1 text-[11px]">
                <ShieldCheck className="size-3 text-primary" />
                {roleLabels[profile.role]}
              </Badge>
              <Badge variant="secondary" className="gap-1.5 rounded-full py-1 text-[11px]">
                <Building2 className="size-3" />
                {profile.departmentName ?? "No dept"}
              </Badge>
              <Badge variant="secondary" className="gap-1.5 rounded-full py-1 font-mono text-[11px]">
                <GraduationCap className="size-3" />
                {profile.regNumber || "No reg."}
              </Badge>
              {profile.claimedPerson ? (
                <Badge variant="outline" className="rounded-full py-1 text-[11px]">
                  Yearbook: {profile.claimedPerson.fullName}
                </Badge>
              ) : null}
            </div>
          </CardContent>
        </Card>

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
            <Card className="rounded-2xl shadow-2xs">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Student Record</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Full name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="regNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Registration number</FormLabel>
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

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Department</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={departmentLocked}
                      >
                        <FormControl>
                          <SelectTrigger className="h-9 w-full rounded-xl">
                            <SelectValue placeholder="Select department" />
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
                      {departmentLocked ? (
                        <FormDescription className="text-[11px]">
                          Assigned by faculty admin.
                        </FormDescription>
                      ) : null}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col gap-2">
                  <Label htmlFor="email" className="text-xs">
                    Google email
                  </Label>
                  <Input id="email" value={profile.email} disabled readOnly />
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={updateMutation.isPending}
                  className="h-9 rounded-xl px-5 text-xs"
                >
                  {updateMutation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : null}
                  {updateMutation.isPending ? "Saving..." : "Save changes"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
}
