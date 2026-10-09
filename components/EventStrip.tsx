"use client";

import Link from "next/link";
import { ArrowRight } from "./icons";
import { useEventClock } from "./useEventClock";

type Props = { href: string; start: string; end: string; label: string; labelMore: string; when: string; time: string; where: string };

export function EventStrip({ href, start, end, label, labelMore, when, time, where }: Props) {
  const clock = useEventClock(start, end, 30_000);

  // Hide the banner a day after the event so it never goes stale.
  if (clock?.phase === "ended" && Date.now() - Date.parse(end) > 86_400_000) return null;

  let status = when;
  if (clock?.phase === "live") status = "Happening now";
  else if (clock?.phase === "upcoming" && clock.today) status = `Today, ${time}`;
  else if (clock?.phase === "ended") status = "Sworn in today";

  return (
    <aside className="strip" aria-label="Upcoming event">
      <Link href={href}>
        <span className="dot pulse-dot" aria-hidden="true" />
        <span>
          {label}
          <span className="hide-sm"> {labelMore}</span>
        </span>
        <span aria-hidden="true">·</span>
        <span>
          {status}
          <span className="hide-sm">, {where}</span>
        </span>
        <span className="arrow">
          <ArrowRight size={16} />
        </span>
      </Link>
    </aside>
  );
}
