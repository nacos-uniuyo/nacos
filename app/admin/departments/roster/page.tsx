"use client";

import { useState } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Loader2,
  Search,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc/client";

export default function CoordinatorRosterPage() {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const debounceRef = useState<ReturnType<typeof setTimeout> | null>(null);

  function handleSearchChange(value: string) {
    setSearchInput(value);
    setPage(1);
    if (debounceRef[0]) clearTimeout(debounceRef[0]);
    const id = setTimeout(() => setDebouncedSearch(value), 350);
    debounceRef[1](id);
  }

  const { data, isLoading, error } = trpc.coordinator.getRoster.useQuery({
    search: debouncedSearch.trim() || undefined,
    page,
    limit: 25,
  });

  const students = data?.students ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
          Department Console
        </p>
        <h1 className="serif mt-1 text-3xl font-bold tracking-tight text-[var(--ink)]">
          Student Roster
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Members and students affiliated with {data?.department.name ?? "this department"}.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]" />
        <Input
          placeholder="Search by name, email, or reg number…"
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex min-h-48 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-[var(--muted)]" />
        </div>
      ) : error ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-2 text-center">
          <AlertCircle className="size-7 text-destructive" />
          <p className="text-sm font-medium text-[var(--ink)]">Failed to load student roster</p>
          <p className="text-xs text-[var(--muted)]">{error.message}</p>
        </div>
      ) : students.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[var(--rule)] bg-[var(--sand)]/30 text-center">
          <GraduationCap className="size-8 text-[var(--muted)]" />
          <div>
            <p className="font-medium text-[var(--ink)]">No students found</p>
            <p className="mt-0.5 text-sm text-[var(--muted)]">
              {debouncedSearch
                ? "No students matched your search criteria."
                : "No students are currently affiliated with this department."}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-[var(--muted)]">
            Showing {students.length} of {total} registered student{total !== 1 ? "s" : ""}
          </p>

          <div className="overflow-hidden rounded-xl border border-[var(--rule)] bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[var(--rule)] bg-[var(--sand)]/40 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  <tr>
                    <th className="px-5 py-3.5">Student</th>
                    <th className="px-5 py-3.5">Registration No.</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--rule)]">
                  {students.map((student) => (
                    <tr key={student.id} className="transition-colors hover:bg-[var(--sand)]/20">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--forest)]/10 text-xs font-bold text-[var(--forest)]">
                            <User className="size-4" />
                          </div>
                          <div>
                            <p className="font-medium text-[var(--ink)]">{student.name}</p>
                            <p className="text-xs text-[var(--muted)]">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {student.regNumber ? (
                          <span className="font-mono text-xs font-semibold text-[var(--ink)]">
                            {student.regNumber}
                          </span>
                        ) : (
                          <span className="text-xs text-[var(--muted)] italic">Not set</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center rounded-full bg-[var(--sand)] px-2 py-0.5 text-xs font-medium text-[var(--muted)] capitalize">
                          {student.role.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-[var(--muted)]">
                        {student.createdAt
                          ? new Date(student.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-[var(--muted)]">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="gap-1"
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
