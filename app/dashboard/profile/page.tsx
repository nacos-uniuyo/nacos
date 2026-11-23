"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  GraduationCap,
  Mail,
  ShieldCheck,
  User as UserIcon,
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
import { trpc } from "@/lib/trpc/client";

export default function ProfilePage() {
  const utils = trpc.useUtils();
  const { data: profile, isLoading, error } = trpc.user.getProfile.useQuery();
  const { data: departments } = trpc.department.list.useQuery();

  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [regNumber, setRegNumber] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setDepartmentId(profile.departmentId ?? "");
      setRegNumber(profile.regNumber ?? "");
    }
  }, [profile]);

  const updateMutation = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      setFeedback({
        type: "success",
        message: "Your profile details have been saved successfully.",
      });
      utils.user.getProfile.invalidate();
      utils.user.getDashboardStats.invalidate();
      setTimeout(() => setFeedback(null), 4000);
    },
    onError: (err) => {
      setFeedback({
        type: "error",
        message: err.message || "Failed to update profile. Please try again.",
      });
    },
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);

    if (!name.trim()) {
      setFeedback({ type: "error", message: "Full name cannot be empty." });
      return;
    }

    updateMutation.mutate({
      name: name.trim(),
      departmentId: departmentId ? departmentId : null,
      regNumber: regNumber.trim() ? regNumber.trim() : null,
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <DashboardHeader
          breadcrumbs={[{ label: "Profile" }]}
          title="My Profile"
          description="Manage your NACOS student credentials and personal details."
        />
        <div className="rounded-xl border border-[var(--rule)] bg-white/70 p-12 text-center text-sm text-[var(--muted)]">
          Loading your profile…
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="space-y-6">
        <DashboardHeader
          breadcrumbs={[{ label: "Profile" }]}
          title="My Profile"
        />
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
          <AlertCircle className="size-5 shrink-0" />
          <span>Could not load profile. Please refresh or sign in again.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <DashboardHeader
        breadcrumbs={[{ label: "Profile" }]}
        title="My Profile"
        description="Manage your NACOS student credentials, registered department, and matriculation number."
      />

      {feedback && (
        <div
          className={`flex items-center gap-3 rounded-xl p-4 text-sm font-medium ${
            feedback.type === "success"
              ? "border border-emerald-300 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"
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

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Main Profile Form */}
        <form onSubmit={handleSubmit}>
          <Card className="border-[var(--rule)] bg-white/80 shadow-xs">
            <CardHeader className="border-b border-[var(--rule)] px-6 py-5">
              <CardTitle className="text-lg font-bold text-[var(--ink)]">
                Student & Academic Information
              </CardTitle>
              <CardDescription className="text-xs">
                Accurate information ensures your coursework group submissions and SIWES records are matched correctly.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 px-6 py-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-[var(--ink)]">
                  Full Name
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    required
                    className="border-[var(--rule)] bg-white pl-9"
                  />
                  <UserIcon className="pointer-events-none absolute left-3 top-2.5 size-4 text-[var(--muted)]" />
                </div>
              </div>

              {/* Email Address (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-[var(--ink)]">
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    value={profile.email}
                    disabled
                    readOnly
                    className="cursor-not-allowed border-[var(--rule)] bg-[var(--sand)]/50 pl-9 text-[var(--muted)]"
                  />
                  <Mail className="pointer-events-none absolute left-3 top-2.5 size-4 text-[var(--muted)]" />
                </div>
                <p className="text-[0.72rem] text-[var(--muted)]">
                  Google account email cannot be edited directly on the portal.
                </p>
              </div>

              {/* Department */}
              <div className="space-y-2">
                <Label htmlFor="department" className="text-sm font-semibold text-[var(--ink)]">
                  Academic Department
                </Label>
                <div className="relative">
                  <select
                    id="department"
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-[var(--rule)] bg-white px-3 py-1 text-sm shadow-xs transition-colors outline-none focus-visible:border-[var(--gold)] focus-visible:ring-2 focus-visible:ring-[var(--gold)]/30"
                  >
                    <option value="">Select your department</option>
                    {departments?.map((dept) => (
                      <option key={dept.slug} value={dept.slug}>
                        {dept.name} ({dept.shortName})
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[0.72rem] text-[var(--muted)]">
                  The department responsible for reviewing your coursework proposals.
                </p>
              </div>

              {/* UNIUYO Registration Number */}
              <div className="space-y-2">
                <Label htmlFor="regNumber" className="text-sm font-semibold text-[var(--ink)]">
                  UNIUYO Registration Number
                </Label>
                <div className="relative">
                  <Input
                    id="regNumber"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. 22/SC/CO/1199"
                    maxLength={32}
                    className="border-[var(--rule)] bg-white pl-9 uppercase tracking-wider"
                  />
                  <GraduationCap className="pointer-events-none absolute left-3 top-2.5 size-4 text-[var(--muted)]" />
                </div>
                <p className="text-[0.72rem] text-[var(--muted)]">
                  Supports double-batch merged prefixes (e.g. 22 or 23 for pioneer sessions).
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex justify-end border-t border-[var(--rule)] bg-[var(--sand)]/20 px-6 py-4">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-[var(--forest)] text-[var(--paper)] hover:bg-[var(--forest-2)]"
              >
                {updateMutation.isPending ? "Saving changes…" : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </form>

        {/* Sidebar Status Card */}
        <div className="space-y-6">
          {/* Identity & Role Card */}
          <Card className="border-[var(--rule)] bg-white/80 shadow-xs">
            <CardHeader className="border-b border-[var(--rule)] pb-4">
              <CardTitle className="text-base font-bold text-[var(--ink)]">
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 text-xs">
              <div>
                <p className="caps text-[0.66rem] tracking-[0.2em] text-[var(--muted)]">
                  Portal Role
                </p>
                <div className="mt-1 flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-[var(--forest)]" />
                  <span className="font-semibold capitalize text-[var(--ink)]">
                    {profile.role.replace("_", " ")}
                  </span>
                </div>
              </div>

              <div>
                <p className="caps text-[0.66rem] tracking-[0.2em] text-[var(--muted)]">
                  Registered Department
                </p>
                <div className="mt-1 flex items-center gap-1.5">
                  <Building2 className="size-4 text-[var(--muted)]" />
                  <span className="font-medium text-[var(--ink)]">
                    {profile.departmentName ?? "Not assigned yet"}
                  </span>
                </div>
              </div>

              <div>
                <p className="caps text-[0.66rem] tracking-[0.2em] text-[var(--muted)]">
                  Registration Number
                </p>
                <p className="mt-1 font-mono font-medium text-[var(--ink)]">
                  {profile.regNumber || "None registered"}
                </p>
              </div>

              {profile.claimedPerson && (
                <div className="rounded-lg border border-[var(--gold)]/40 bg-[var(--gold)]/10 p-3">
                  <p className="font-semibold text-[var(--forest)]">
                    Yearbook Linked
                  </p>
                  <p className="mt-0.5 text-[0.72rem] text-[var(--muted)]">
                    Connected to {profile.claimedPerson.fullName} (
                    {profile.claimedPerson.currentRole ?? "Alumnus / Officer"})
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
