"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import { GraduationCap, Search } from "lucide-react";
import { AlumniCard } from "@/components/AlumniCard";
import { DraggableMarquee } from "@/components/DraggableMarquee";
import { ArrowRight, ArrowUpRight } from "@/components/icons";
import { sortAlumniByMatricOrName } from "@/components/SessionCohortGrid";
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
  initialAlumni: PersonSummary[];
  departments: DepartmentSummary[];
  sessions: SchoolSessionSummary[];
};

export function YearbookGallery({ initialAlumni, departments, sessions }: Props) {
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

  const sessionMap = useMemo(() => {
    return new Map(sessions.map((s) => [s.slug, s.name]));
  }, [sessions]);

  const isFiltering = selectedDept !== "all" || searchQuery.trim().length > 0;

  const filteredAlumni = useMemo(() => {
    return initialAlumni
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
  }, [initialAlumni, selectedDept, searchQuery, deptMap]);

  // Grouping alumni by session for the full-width carousels
  const sessionCohorts = useMemo(() => {
    return sessions.map((session, index) => {
      const cohortMembers = initialAlumni
        .filter((a) => a.sessionSlug === session.slug)
        .slice()
        .sort(sortAlumniByMatricOrName);
      return {
        session,
        members: cohortMembers,
        reverse: index % 2 === 1,
      };
    }).filter((c) => c.members.length > 0);
  }, [sessions, initialAlumni]);

  return (
    <div className="flex flex-col gap-14">
      {/* Search and Scope Controls */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <label htmlFor={searchInputId} className="sr-only">
            Search alumni, roles, companies or graduate names
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
            placeholder="Search by graduate, company, role, or award..."
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[var(--card-surface)] border border-[var(--rule)] text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--green)] shadow-xs transition-colors"
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

      {/* When filtering or searching: Render filtered grid */}
      {isFiltering ? (
        filteredAlumni.length === 0 ? (
          <div className="text-center py-20 bg-[var(--card-surface)] rounded-xl border border-[var(--rule)] p-8">
            <p className="serif text-2xl text-[var(--ink)] mb-2">No graduating alumni found</p>
            <p className="text-sm text-[var(--muted)] max-w-md mx-auto mb-6">
              Try adjusting your search terms or resetting the department scope filter.
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full text-left">
            {filteredAlumni.map((alum) => (
              <AlumniCard
                key={alum.slug}
                alum={alum}
                deptName={alum.departmentSlug ? deptMap.get(alum.departmentSlug) ?? null : null}
                sessionName={sessionMap.get(alum.sessionSlug) ?? alum.sessionSlug}
              />
            ))}
          </div>
        )
      ) : (
        /* Default View: Full-width auto-looping marquee carousels partitioned by graduating sets */
        <div className="flex flex-col gap-16">
          {sessionCohorts.map(({ session, members, reverse }) => {
            return (
              <div key={session.slug} className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center size-8 rounded-full bg-[var(--paper)] text-[var(--green)] border border-[var(--rule)]">
                      <GraduationCap size={16} />
                    </span>
                    <div>
                      <h2 className="serif text-2xl sm:text-3xl text-[var(--ink)] m-0">
                        {session.name}
                      </h2>
                      {session.theme && (
                        <p className="text-xs font-semibold text-[var(--gold)] m-0">
                          &ldquo;{session.theme}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    <span className="text-xs font-medium text-[var(--muted)] hidden sm:inline">
                      {members.length} {members.length === 1 ? "Honoured Graduate" : "Honoured Graduates"}
                    </span>
                    <Link
                      href={`/yearbook/session/${session.slug}`}
                      className="inline-flex items-center justify-center size-8 rounded-full bg-[var(--card-surface)] border border-[var(--rule)] text-[var(--ink)] hover:bg-primary hover:text-primary-foreground transition-all shadow-xs"
                      aria-label={`Explore ${session.name} cohort`}
                    >
                      <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </div>

                <div className="yearbook-carousel-container">
                  <DraggableMarquee
                    speed={38}
                    direction={reverse ? "right" : "left"}
                  >
                    {members.map((alum) => (
                      <div key={alum.slug} className="flex w-[320px] sm:w-[350px] shrink-0">
                        <AlumniCard
                          alum={alum}
                          deptName={alum.departmentSlug ? deptMap.get(alum.departmentSlug) ?? null : null}
                          sessionName={sessionMap.get(alum.sessionSlug) ?? alum.sessionSlug}
                        />
                      </div>
                    ))}
                  </DraggableMarquee>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
