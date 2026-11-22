"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
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
            const typeLabel = OPPORTUNITY_TYPE_LABELS[opp.type] ?? opp.type;
            const deptName = opp.departmentSlug ? deptMap.get(opp.departmentSlug) : null;
            const deadlineLabel = formatDeadline(opp.deadline);
            const hasInternal = opp.hasInternalDetails || !opp.applyUrl;
            const isExternal =
              Boolean(opp.applyUrl) &&
              (opp.applyUrl!.startsWith("http://") || opp.applyUrl!.startsWith("https://"));

            const targetHref = hasInternal ? `/opportunities/${opp.slug}` : (opp.applyUrl ?? "#");
            const linkProps = !hasInternal && isExternal
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {};

            return (
              <Link
                key={opp.slug}
                href={targetHref}
                {...linkProps}
                className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-[var(--green)] rounded-2xl group cursor-pointer no-underline text-inherit"
              >
                <div className="h-full min-h-[380px] sm:min-h-[420px] flex flex-col justify-between overflow-hidden relative border border-white/10 bg-[#0e1713] rounded-2xl p-0 py-0 gap-0 transition-all duration-500 hover:shadow-2xl hover:border-white/20 select-none">
                  {/* Base Background Image Layer (Unblurred & Zoomable) */}
                  {opp.imageUrl && (
                    <div className="absolute inset-0 z-0 overflow-hidden">
                      <Image
                        src={opp.imageUrl}
                        alt={opp.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    </div>
                  )}

                  {/* Progressive Blur Layer */}
                  <div
                    className="absolute inset-0 z-[1] pointer-events-none backdrop-blur-[6px] overflow-hidden"
                    style={{
                      maskImage:
                        "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0.2) 75%, rgba(0,0,0,0) 100%)",
                      WebkitMaskImage:
                        "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0.2) 75%, rgba(0,0,0,0) 100%)",
                    }}
                  />

                  {/* Smooth Directional Gradient Shade */}
                  <div
                    className="absolute inset-0 z-[2] pointer-events-none transition-opacity duration-500 group-hover:opacity-95"
                    style={{
                      background:
                        "linear-gradient(to bottom, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.25) 35%, rgba(0, 0, 0, 0.68) 65%, rgba(0, 0, 0, 0.90) 100%)",
                    }}
                  />

                  {/* Top metadata overlay */}
                  <div className="relative z-10 px-5 sm:px-6 pt-5 sm:pt-6 pb-0 flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-medium text-white/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] uppercase tracking-wider">
                      {deadlineLabel}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      <span className="text-[11px] font-mono bg-black/40 text-white/95 border border-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full font-normal shadow-sm">
                        {typeLabel}
                      </span>
                      {deptName ? (
                        <span className="text-[10px] font-mono bg-black/30 text-white/80 border border-white/15 backdrop-blur-xs px-2 py-0.5 rounded-full font-normal">
                          {deptName}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono bg-black/30 text-[var(--gold)] border border-[rgba(217,163,66,0.3)] backdrop-blur-xs px-2 py-0.5 rounded-full font-normal">
                          Faculty
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Card Content */}
                  <div className="relative z-10 mt-auto px-5 sm:px-6 pt-2 pb-5 sm:pb-6 flex flex-col justify-end">
                    <p className="text-[11px] font-mono uppercase tracking-wider text-white/70 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] mb-1.5">
                      <span>{opp.orgName}</span>
                      <span className="mx-1.5 text-white/40">·</span>
                      <span>{opp.location}</span>
                    </p>

                    <h3 className="font-mono text-xl sm:text-2xl font-bold leading-snug text-white mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                      {opp.title}
                    </h3>

                    {opp.excerpt && (
                      <p className="text-white/80 text-xs sm:text-sm leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] line-clamp-3 mb-0">
                        {opp.excerpt}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
