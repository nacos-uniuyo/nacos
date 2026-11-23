"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AlumniCard } from "@/components/AlumniCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DepartmentSummary, PersonSummary, SchoolSessionSummary } from "@/server/contracts";

type Props = {
  cohortAlumni: PersonSummary[];
  departments: DepartmentSummary[];
  session: SchoolSessionSummary;
};

export function sortAlumniByMatricOrName(a: PersonSummary, b: PersonSummary): number {
  if (a.matricNumber && b.matricNumber) {
    return a.matricNumber.localeCompare(b.matricNumber, undefined, { numeric: true, sensitivity: "base" });
  }
  if (a.matricNumber) return -1;
  if (b.matricNumber) return 1;
  return a.fullName.localeCompare(b.fullName);
}

export function SessionCohortGrid({ cohortAlumni, departments, session }: Props) {
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const searchInputId = useId();

  // Initialize from window.location on mount without triggering Next.js router navigation
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const deptParam = params.get("department");
    const qParam = params.get("q");
    if (deptParam) setSelectedDept(deptParam);
    if (qParam) setSearchQuery(qParam);

    const handlePopState = () => {
      const currentParams = new URLSearchParams(window.location.search);
      setSelectedDept(currentParams.get("department") ?? "all");
      setSearchQuery(currentParams.get("q") ?? "");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const updateFilters = useCallback(
    (newDept: string, newQuery: string) => {
      setSelectedDept(newDept);
      setSearchQuery(newQuery);

      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      if (newDept && newDept !== "all") {
        params.set("department", newDept);
      } else {
        params.delete("department");
      }
      if (newQuery.trim()) {
        params.set("q", newQuery.trim());
      } else {
        params.delete("q");
      }

      const queryStr = params.toString();
      const newUrl = queryStr ? `${window.location.pathname}?${queryStr}` : window.location.pathname;
      window.history.replaceState(null, "", newUrl);
    },
    [],
  );

  const deptMap = useMemo(() => {
    return new Map(departments.map((d) => [d.slug, d.name]));
  }, [departments]);

  const filteredAlumni = useMemo(() => {
    return cohortAlumni
      .filter((alum) => {
        if (selectedDept !== "all" && alum.departmentSlug !== selectedDept) {
          return false;
        }
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchesName = alum.fullName.toLowerCase().includes(query);
          const matchesMatric = (alum.matricNumber ?? "").toLowerCase().includes(query);
          const matchesRole = alum.roleTitle.toLowerCase().includes(query);
          const matchesCompany = (alum.currentCompany ?? "").toLowerCase().includes(query);
          const matchesCurrentRole = (alum.currentRole ?? "").toLowerCase().includes(query);
          const deptName = alum.departmentSlug ? deptMap.get(alum.departmentSlug) ?? "" : "";
          const matchesDept = deptName.toLowerCase().includes(query);
          return matchesName || matchesMatric || matchesRole || matchesCompany || matchesCurrentRole || matchesDept;
        }
        return true;
      })
      .slice()
      .sort(sortAlumniByMatricOrName);
  }, [cohortAlumni, selectedDept, searchQuery, deptMap]);

  return (
    <div className="flex flex-col gap-10">
      {/* Controls: Search and Department Scope */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <label htmlFor={searchInputId} className="sr-only">
            Search cohort graduates by name, role, or company
          </label>
          <Search
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
          />
          <input
            id={searchInputId}
            type="text"
            value={searchQuery}
            onChange={(e) => updateFilters(selectedDept, e.target.value)}
            placeholder="Search cohort by graduate, company, role, or award..."
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-white border border-[rgba(15,26,19,0.12)] text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--green)] shadow-xs transition-colors"
          />
        </div>

        <div className="w-full sm:w-auto flex items-center gap-3 justify-end">
          <span className="text-xs text-[var(--muted)] font-medium whitespace-nowrap">
            Department:
          </span>
          <div className="w-[230px]">
            <Select
              value={selectedDept}
              onValueChange={(val) => updateFilters(val, searchQuery)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.slug} value={d.slug}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Grid of Cards */}
      {filteredAlumni.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-[rgba(15,26,19,0.12)] p-8">
          <p className="serif text-2xl text-[var(--ink)] mb-2">No matching graduates in this cohort</p>
          <p className="text-sm text-[var(--muted)] max-w-md mx-auto mb-6">
            Try adjusting your search query or broadening your department filter.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => updateFilters("all", "")}
            className="text-[var(--ink)] rounded-full px-6"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full text-left">
          {filteredAlumni.map((alum) => (
            <AlumniCard
              key={alum.slug}
              alum={alum}
              deptName={alum.departmentSlug ? deptMap.get(alum.departmentSlug) ?? null : null}
              sessionName={session.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}
