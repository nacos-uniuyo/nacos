"use client";

import { useEventClock } from "./useEventClock";

const pad = (n: number) => String(n).padStart(2, "0");

export function Countdown({ start, end }: { start: string; end: string }) {
  const clock = useEventClock(start, end);

  if (clock?.phase === "live") {
    return (
      <p className="inline-flex items-center gap-3 self-start py-3 px-4.5 rounded-full bg-[rgba(216,180,92,0.12)] border border-[rgba(216,180,92,0.4)] text-[15px] font-semibold text-white" role="status">
        <span className="size-2 rounded-full bg-[var(--gold)] animate-pulse" aria-hidden="true" />
        The ceremony is underway at 5 Arms
      </p>
    );
  }

  if (clock?.phase === "ended") {
    return (
      <p className="inline-flex items-center gap-3 self-start py-3 px-4.5 rounded-full bg-[rgba(216,180,92,0.12)] border border-[rgba(216,180,92,0.4)] text-[15px] font-semibold text-white" role="status">
        The 4th Executive Council has been sworn in. Thank you for coming.
      </p>
    );
  }

  const units: [string, number | undefined][] = [
    ["Days", clock?.days],
    ["Hours", clock?.hours],
    ["Minutes", clock?.minutes],
    ["Seconds", clock?.seconds],
  ];

  return (
    <div className="grid grid-cols-4 gap-2.5 max-w-[520px]" role="timer" aria-label="Time until the ceremony begins">
      {units.map(([label, value]) => (
        <div className="border border-white/16 rounded-[14px] py-4 px-3 sm:py-3.5 bg-white/3 flex flex-col gap-1.5" key={label}>
          <span className="serif text-[clamp(36px,4vw,52px)] leading-none tabular-nums text-white">{value === undefined ? "--" : pad(value)}</span>
          <span className="caps text-[10px] text-[var(--mint)] tracking-wider">{label}</span>
        </div>
      ))}
    </div>
  );
}
