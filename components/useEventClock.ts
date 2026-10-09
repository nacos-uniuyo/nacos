"use client";

import { useEffect, useState } from "react";

export type Phase = "upcoming" | "live" | "ended";

export type Clock = {
  phase: Phase;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** True when the event falls on the visitor's current Lagos calendar day. */
  today: boolean;
};

const lagosDay = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" });

function read(start: number, end: number, now: number): Clock {
  const phase: Phase = now < start ? "upcoming" : now < end ? "live" : "ended";
  const diff = Math.max(0, start - now);
  const s = Math.floor(diff / 1000);
  return {
    phase,
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    today: lagosDay(new Date(now)) === lagosDay(new Date(start)),
  };
}

/** Returns null until mounted so server and client markup match. */
export function useEventClock(startIso: string, endIso: string, tickMs = 1000) {
  const [clock, setClock] = useState<Clock | null>(null);

  useEffect(() => {
    const start = Date.parse(startIso);
    const end = Date.parse(endIso);
    const update = () => setClock(read(start, end, Date.now()));
    update();
    const id = window.setInterval(update, tickMs);
    return () => window.clearInterval(id);
  }, [startIso, endIso, tickMs]);

  return clock;
}
