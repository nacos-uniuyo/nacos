import * as React from "react";
import { cn } from "@/lib/utils";

interface CommitmentItem {
  title: string;
  owner: string;
}

interface OpenTrackerProps {
  commitments: CommitmentItem[];
  className?: string;
}

export function OpenTracker({ commitments, className }: OpenTrackerProps) {
  return (
    <div
      className={cn(
        "flex flex-col bg-white rounded-xl shadow-[0_30px_70px_rgba(6,42,20,0.12)] p-6 sm:p-8",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4 pb-3.5 border-b border-[var(--rule)] text-[15px] font-semibold text-[var(--ink)]">
        <span>Session commitments</span>
        <span className="inline-flex items-center gap-2 text-[13px] font-normal text-[var(--muted)]">
          <span className="size-2 rounded-full bg-[var(--green)] animate-pulse" aria-hidden="true" />
          Live tracking active
        </span>
      </div>

      <ul className="m-0 p-0 list-none divide-y divide-[var(--rule-soft)]">
        {commitments.map((c) => (
          <li key={c.title} className="flex flex-wrap sm:flex-nowrap items-center gap-4 py-3.5">
            <span className="flex-1 min-w-[200px] flex flex-col gap-1">
              <strong className="text-[15px] text-[var(--ink)]">{c.title}</strong>
              <span className="text-[13px] text-[var(--muted)]">{c.owner}</span>
            </span>

            <span
              className="w-full sm:w-[140px] h-1.5 rounded-full bg-[var(--rule)] overflow-hidden shrink-0"
              role="progressbar"
              aria-label={`${c.title} progress`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={0}
            >
              <span className="block h-full bg-[var(--green)] w-0" />
            </span>

            <span className="w-auto sm:w-[92px] text-right text-xs font-semibold text-[var(--muted)] shrink-0">
              Not started
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
