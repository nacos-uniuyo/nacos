"use client";

import { useEffect, useRef, useState } from "react";
import { CouncilPersonCard } from "@/components/CouncilPersonCard";
import type { PersonSummary, SchoolSessionSummary } from "@/server/contracts";

type SessionCohortData = {
  session: SchoolSessionSummary;
  excos: PersonSummary[];
  aides: PersonSummary[];
  devTeam: PersonSummary[];
};

type Props = {
  initialSessionsData: SessionCohortData[];
};

export function ExecutivesInfiniteList({ initialSessionsData }: Props) {
  const [visibleCount, setVisibleCount] = useState(1);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visibleCount >= initialSessionsData.length) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 1, initialSessionsData.length));
        }
      },
      { rootMargin: "300px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [visibleCount, initialSessionsData.length]);

  const visibleSessions = initialSessionsData.slice(0, visibleCount);

  return (
    <div className="flex flex-col gap-16 sm:gap-24 w-full">
      {visibleSessions.map((sessionData, sIndex) => {
        const { session, excos, aides, devTeam } = sessionData;

        return (
          <div
            key={session.slug}
            className={`flex flex-col gap-12 ${sIndex > 0 ? "pt-14 sm:pt-20 border-t border-[rgba(15,26,19,0.12)]" : ""}`}
          >
            {/* Session Banner */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--forest)]">
                {session.name}
              </span>
              {session.theme && (
                <span className="serif italic text-lg sm:text-xl text-[var(--gold)]">
                  &ldquo;{session.theme}&rdquo;
                </span>
              )}
            </div>

            {/* 1. Faculty Elected Council Excos */}
            {excos.length > 0 && (
              <section aria-labelledby={`excos-${session.slug}`}>
                <div className="mb-6">
                  <h2 id={`excos-${session.slug}`} className="serif text-2xl sm:text-3xl text-[var(--ink)] m-0">
                    Executive Council
                  </h2>
                </div>
                <ul className="exec-grid">
                  {excos.map((person, i) => (
                    <li key={person.slug} className="reveal">
                      <CouncilPersonCard
                        person={person}
                        index={i}
                        priority={sIndex === 0 && i < 4}
                        sessionName={session.name}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* 2. Presidential Aides */}
            {aides.length > 0 && (
              <section aria-labelledby={`aides-${session.slug}`}>
                <div className="mb-6">
                  <h2 id={`aides-${session.slug}`} className="serif text-2xl sm:text-3xl text-[var(--ink)] m-0">
                    Presidential Aides &amp; Assistants
                  </h2>
                </div>
                <ul className="exec-grid">
                  {aides.map((person, i) => (
                    <li key={person.slug} className="reveal">
                      <CouncilPersonCard
                        person={person}
                        index={i}
                        sessionName={session.name}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* 3. Developer & Technical Team */}
            {devTeam.length > 0 && (
              <section aria-labelledby={`dev-${session.slug}`}>
                <div className="mb-6">
                  <h2 id={`dev-${session.slug}`} className="serif text-2xl sm:text-3xl text-[var(--ink)] m-0">
                    Software Directorate &amp; Developer Team
                  </h2>
                </div>
                <ul className="exec-grid">
                  {devTeam.map((person, i) => (
                    <li key={person.slug} className="reveal">
                      <CouncilPersonCard
                        person={person}
                        index={i}
                        sessionName={session.name}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        );
      })}

      {/* Sentinel for infinite scroll */}
      {visibleCount < initialSessionsData.length && (
        <div ref={sentinelRef} className="py-12 flex flex-col items-center gap-4 w-full">
          <div className="w-full max-w-sm h-3 rounded-full bg-[rgba(6,42,20,0.08)] animate-pulse" />
          <div className="w-full max-w-xs h-3 rounded-full bg-[rgba(6,42,20,0.05)] animate-pulse" />
        </div>
      )}
    </div>
  );
}
