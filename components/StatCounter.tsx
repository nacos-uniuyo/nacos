"use client";

import { useEffect, useRef, useState } from "react";

type Stat = { label: string; value: number; suffix?: string; compact?: boolean };

const plain = new Intl.NumberFormat("en-US");
const short = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 0 });

/** Server renders the final numbers; the count-up only runs in the browser when the row scrolls into view. */
export function StatCounter({ stats }: { stats: Stat[] }) {
  const ref = useRef<HTMLDListElement>(null);
  const [t, setT] = useState(1);

  useEffect(() => {
    const el = ref.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!el || reduce || !("IntersectionObserver" in window)) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    let raf = 0;
    setT(0);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        let start: number | null = null;
        const step = (ts: number) => {
          start ??= ts;
          const p = Math.min(1, (ts - start) / 1800);
          setT(1 - Math.pow(1 - p, 3));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <dl className="stats-grid" ref={ref}>
      {stats.map((s) => (
        <div className="stat" key={s.label}>
          <dt>{s.label}</dt>
          <dd className="serif">
            {(s.compact ? short : plain).format(Math.round(s.value * t))}
            {s.suffix}
          </dd>
        </div>
      ))}
    </dl>
  );
}
