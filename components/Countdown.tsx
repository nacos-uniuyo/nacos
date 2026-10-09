"use client";

import { useEventClock } from "./useEventClock";

const pad = (n: number) => String(n).padStart(2, "0");

export function Countdown({ start, end }: { start: string; end: string }) {
  const clock = useEventClock(start, end);

  if (clock?.phase === "live") {
    return (
      <p className="live" role="status">
        <span className="pulse-dot" aria-hidden="true" />
        The ceremony is underway at 5 Arms
      </p>
    );
  }

  if (clock?.phase === "ended") {
    return (
      <p className="live" role="status">
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
    <div className="countdown" role="timer" aria-label="Time until the ceremony begins">
      {units.map(([label, value]) => (
        <div className="unit" key={label}>
          <span className="n serif">{value === undefined ? "--" : pad(value)}</span>
          <span className="l caps">{label}</span>
        </div>
      ))}
    </div>
  );
}
