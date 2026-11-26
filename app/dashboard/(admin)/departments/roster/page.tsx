"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, GraduationCap, Search, User } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/dashboard/DashboardStates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
      <DashboardHeader
        title="Student Roster"
        description={`Members and students affiliated with ${data?.department.name ?? "this department"}.`}
      />

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or reg number…"
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <ListSkeleton count={5} />
      ) : error ? (
        <ErrorState title="Failed to load student roster" message={error.message} />
      ) : students.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="size-5" />}
          title="No students found"
          description={
            debouncedSearch
              ? "No students matched your search criteria."
              : "No students are currently affiliated with this department."
          }
        />
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Showing {students.length} of {total} registered student{total !== 1 ? "s" : ""}
          </p>

          <Card className="overflow-hidden py-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3.5">Student</th>
                    <th className="px-5 py-3.5">Registration No.</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {students.map((student) => (
                    <tr key={student.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            <User className="size-4" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{student.name}</p>
                            <p className="text-xs text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {student.regNumber ? (
                          <span className="font-mono text-xs font-semibold text-foreground">
                            {student.regNumber}
                          </span>
                        ) : (
                          <span className="text-xs italic text-muted-foreground">Not set</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant="secondary" className="capitalize">
                          {student.role.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-xs text-muted-foreground">
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
          </Card>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-muted-foreground">
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
