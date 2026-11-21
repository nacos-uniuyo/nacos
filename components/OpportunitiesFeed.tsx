"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Calendar,
  GraduationCap,
  Handshake,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";
import { ArrowRight, ArrowUpRight } from "@/components/icons";
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

const TYPE_ICONS: Record<OpportunityType, React.ElementType> = {
  job: Briefcase,
  siwes_it: Briefcase,
  scholarship: GraduationCap,
  sponsorship: Sparkles,
  partnership: Handshake,
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
    if (!deadlineString) return "Rolling admissions";
    try {
      const date = new Date(deadlineString);
      return `Deadline: ${date.toLocaleDateString("en-NG", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    } catch {
      return "Active";
    }
  }

  return (
    <div className="flex flex-col gap-10">
      {/* 1. Centered Segmented Type Pill Bar */}
      <div className="flex flex-col items-center gap-6">
        <div className="segmented-filter-bar">
          {availableTypes.map((tab) => {
            const isActive = selectedType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedType(tab.id)}
                className={`segmented-filter-btn ${isActive ? "active" : ""}`}
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
              className="w-full pl-11 pr-4 py-2.5 rounded-full bg-white border border-[rgba(15,26,19,0.12)] text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--green)] shadow-xs transition-colors"
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
                  <SelectItem value="faculty-wide">Faculty-Wide Opportunities</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d.slug} value={d.slug}>
                      Department of {d.name}
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
        <div className="text-center py-20 bg-white rounded-[24px] border border-[rgba(15,26,19,0.12)] p-8">
          <p className="serif text-2xl text-[var(--ink)] mb-2">No matching opportunities found</p>
          <p className="text-sm text-[var(--muted)] max-w-md mx-auto mb-6">
            Try adjusting your search query, selecting another category pill, or broadening your departmental scope.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedType("all");
              setSelectedDept("all");
              setSearchQuery("");
            }}
            className="btn btn-ghost"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full text-left">
          {filteredOpportunities.map((opp) => {
            const Icon = TYPE_ICONS[opp.type] ?? Briefcase;
            const typeLabel = OPPORTUNITY_TYPE_LABELS[opp.type] ?? opp.type;
            const deptName = opp.departmentSlug ? deptMap.get(opp.departmentSlug) : null;
            const deadlineLabel = formatDeadline(opp.deadline);
            const hasInternal = opp.hasInternalDetails || !opp.applyUrl;
            const isExternal =
              Boolean(opp.applyUrl) &&
              (opp.applyUrl!.startsWith("http://") || opp.applyUrl!.startsWith("https://"));

            return (
              <div
                key={opp.slug}
                className="group flex flex-col justify-between bg-white rounded-[20px] border border-[rgba(15,26,19,0.12)] p-6 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex flex-col gap-4">
                  {/* Top Row: Type Badge and Scope */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-[var(--paper)] border border-[rgba(15,26,19,0.08)] text-[11px] font-semibold text-[var(--forest)]">
                      <Icon size={13} className="text-[var(--green)]" />
                      <span>{typeLabel}</span>
                    </span>

                    {deptName ? (
                      <span className="text-[11px] font-medium text-[var(--muted)] line-clamp-1">
                        Department of {deptName}
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-[var(--gold)]">
                        Faculty of Computing
                      </span>
                    )}
                  </div>

                  {/* Title and Organization */}
                  <div className="flex flex-col gap-1.5">
                    <h3 className="serif text-xl sm:text-2xl text-[var(--ink)] leading-snug group-hover:text-[var(--green)] transition-colors m-0">
                      {hasInternal ? (
                        <Link href={`/opportunities/${opp.slug}`} className="no-underline text-inherit hover:text-[var(--green)]">
                          {opp.title}
                        </Link>
                      ) : (
                        opp.title
                      )}
                    </h3>
                    <p className="text-sm font-semibold text-[var(--muted)] flex items-center gap-1.5 m-0">
                      <span>{opp.orgName}</span>
                    </p>
                  </div>

                  {/* Metadata Row: Location and Deadline */}
                  <div className="flex flex-col gap-2 pt-2 text-xs text-[var(--muted)]">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-[var(--forest)] shrink-0" />
                      <span>{opp.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-[var(--forest)] shrink-0" />
                      <span>{deadlineLabel}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom CTA Button */}
                <div className="pt-5 mt-5 border-t border-[rgba(15,26,19,0.08)] flex items-center justify-between">
                  {hasInternal ? (
                    <Link
                      href={`/opportunities/${opp.slug}`}
                      className="btn btn-solid w-full"
                    >
                      <span>View Details</span>
                      <ArrowRight size={15} />
                    </Link>
                  ) : (
                    <a
                      href={opp.applyUrl!}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      className="btn btn-solid w-full"
                    >
                      <span>Apply Externally</span>
                      <ArrowUpRight size={15} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
