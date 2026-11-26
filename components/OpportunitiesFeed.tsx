"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { NoticeCard } from "@/components/NoticeCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OpportunityType } from "@/lib/enums";
import type { DepartmentSummary, OpportunitySummary } from "@/server/contracts";

const OPPORTUNITY_TYPE_LABELS: Record<OpportunityType, string> = {
  job: "Job",
  siwes_it: "SIWES/IT",
  scholarship: "Scholarship",
  sponsorship: "Sponsorship",
  partnership: "Partnership",
};

type Props = {
  initialOpportunities: OpportunitySummary[];
  departments: DepartmentSummary[];
};

export function OpportunitiesFeed({ initialOpportunities, departments }: Props) {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const deptMap = useMemo(() => {
    return new Map(departments.map((d) => [d.slug, d.name]));
  }, [departments]);

  const filteredOpportunities = useMemo(() => {
    return initialOpportunities.filter((opp) => {
      if (selectedType !== "all" && opp.type !== selectedType) {
        return false;
      }
      if (selectedDept !== "all") {
        if (selectedDept === "faculty-wide" && opp.departmentSlug !== null) {
          return false;
        }
        if (selectedDept !== "faculty-wide" && opp.departmentSlug !== selectedDept) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = opp.title.toLowerCase().includes(query);
        const matchesOrg = opp.orgName.toLowerCase().includes(query);
        const matchesLocation = opp.location.toLowerCase().includes(query);
        const deptName = opp.departmentSlug ? deptMap.get(opp.departmentSlug) ?? "" : "";
        const matchesDept = deptName.toLowerCase().includes(query);
        return matchesTitle || matchesOrg || matchesLocation || matchesDept;
      }
      return true;
    });
  }, [initialOpportunities, selectedType, selectedDept, searchQuery, deptMap]);

  const availableTypes: { id: string; label: string }[] = useMemo(() => {
    const presentTypes = new Set(initialOpportunities.map((o) => o.type));
    const items = [{ id: "all", label: "All Opportunities" }];
    Object.entries(OPPORTUNITY_TYPE_LABELS).forEach(([typeKey, label]) => {
      if (presentTypes.has(typeKey as OpportunityType)) {
        items.push({ id: typeKey, label });
      }
    });
    return items;
  }, [initialOpportunities]);

  function formatDeadline(deadlineString: string | null): string {
    if (!deadlineString) return "ROLLING ADMISSIONS";
    try {
      const date = new Date(deadlineString);
      const formatted = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "Africa/Lagos",
      });
      return formatted.toUpperCase();
    } catch {
      return "ACTIVE";
    }
  }

  return (
    <div className="flex flex-col gap-10">
      {/* 1. Centered Responsive Type Pill Bar */}
      <div className="flex flex-col items-center gap-6">
        <div
          role="tablist"
          aria-label="Filter opportunities by type"
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 w-full max-w-4xl"
        >
          {availableTypes.map((tab) => {
            const isActive = selectedType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setSelectedType(tab.id)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer border ${
                  isActive
                    ? "bg-[var(--forest)] text-white border-[var(--forest)] shadow-sm dark:bg-[var(--mint)] dark:text-[#062a14] dark:border-[var(--mint)]"
                    : "bg-[var(--sand)] text-[var(--muted)] border-[var(--rule)] hover:text-[var(--ink)] hover:border-[var(--ink)]/30"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 2. Controls: Search Input & Department Scope Selector */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          {/* Search Box */}
          <div className="relative w-full sm:max-w-md">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search opportunities, organizations, locations..."
              className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[var(--card-surface)] border border-[var(--rule)] text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--green)] shadow-xs transition-colors"
            />
          </div>

          {/* Department Scope Selector with Radix/Base-UI Select */}
          <div className="w-full sm:w-auto flex items-center gap-3 justify-end">
            <span className="text-xs text-[var(--muted)] font-medium whitespace-nowrap">
              Filter by Scope:
            </span>
            <div className="w-[220px]">
              <Select value={selectedDept} onValueChange={setSelectedDept}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Scopes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scopes</SelectItem>
                  <SelectItem value="faculty-wide">Faculty</SelectItem>
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
      </div>

      {/* 3. Opportunities Cards Grid */}
      {filteredOpportunities.length === 0 ? (
        <div className="text-center py-20 bg-[var(--card-surface)] rounded-xl border border-[var(--rule)] p-8">
          <p className="serif text-2xl text-[var(--ink)] mb-2">No matching opportunities found</p>
          <p className="text-sm text-[var(--muted)] max-w-md mx-auto mb-6">
            Try adjusting your search query, selecting another category pill, or broadening your departmental scope.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSelectedType("all");
              setSelectedDept("all");
              setSearchQuery("");
            }}
            className="text-[var(--ink)] rounded-full px-6"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full text-left">
          {filteredOpportunities.map((opp) => {
            const typeLabel = OPPORTUNITY_TYPE_LABELS[opp.type] ?? opp.type;
            const deptName = opp.departmentSlug ? deptMap.get(opp.departmentSlug) : null;
            const deadlineLabel = formatDeadline(opp.deadline);
            const hasInternal = opp.hasInternalDetails || !opp.applyUrl;
            const isExternal =
              Boolean(opp.applyUrl) &&
              (opp.applyUrl!.startsWith("http://") || opp.applyUrl!.startsWith("https://"));

            const targetHref = hasInternal ? `/opportunities/${opp.slug}` : (opp.applyUrl ?? "#");

            return (
              <NoticeCard
                key={opp.slug}
                href={targetHref}
                isExternal={!hasInternal && isExternal}
                dateLabel={deadlineLabel}
                badgeLabel={typeLabel}
                secondaryBadge={
                  deptName
                    ? { label: deptName }
                    : { label: "Faculty", highlight: true }
                }
                eyebrow={`${opp.orgName} · ${opp.location}`}
                title={opp.title}
                excerpt={opp.excerpt}
                imageUrl={opp.imageUrl}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
