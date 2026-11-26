import Image from "next/image";
import { initials } from "@/lib/executives";
import type { PersonSummary } from "@/server/contracts";

const SIZES = "(max-width: 680px) 46vw, (max-width: 1100px) 31vw, 300px";

const tierLabels: Record<string, string> = {
  elected_exco: "Elected Executive",
  aide: "Executive Aide",
  dev_team: "Software & Dev Team",
  alumni: "Graduating Alumnus",
};

type Props = {
  person: PersonSummary;
  index: number;
  priority?: boolean;
  sessionName?: string;
  departmentName?: string | null;
};

export function CouncilPersonCard({ person, index, priority, departmentName }: Props) {
  const badgeLabel = tierLabels[person.tier] ?? person.tier;

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-[22px] border border-[var(--rule)] bg-[var(--sand)] shadow-[0_4px_20px_-4px_rgba(25,51,34,0.08)] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.2,0.7,0.1,1)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.35)]"
      id={person.slug}
    >
      {person.photoUrl ? (
        <div className="relative aspect-[4/4.2] w-full overflow-hidden bg-[var(--forest)]">
          <Image
            src={person.photoUrl}
            alt={`${person.fullName}, ${person.roleTitle}`}
            fill
            sizes={SIZES}
            priority={priority}
            className="object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.2,0.7,0.1,1)] motion-safe:group-hover:scale-[1.06]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(6,42,20,0.35)] via-transparent to-transparent" />
          <div
            className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-900 ease-out motion-safe:group-hover:translate-x-[400%]"
            aria-hidden="true"
          />
          <span className="caps absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-[9.5px] tracking-[0.06em] text-[#062a14] backdrop-blur-md dark:bg-[rgba(6,42,20,0.65)] dark:text-white/90" aria-hidden="true">
            {badgeLabel}
          </span>
        </div>
      ) : (
        <div
          className={`relative flex aspect-[4/4.2] w-full items-center justify-center overflow-hidden text-white ${
            index % 2 ? "bg-[var(--forest-2)]" : "bg-[var(--forest)]"
          }`}
          aria-hidden="true"
        >
          <svg className="absolute inset-0 size-full" viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice">
            <circle cx="100" cy="125" r="78" fill="none" stroke="rgba(216,180,92,.35)" />
            <circle cx="100" cy="125" r="104" fill="none" stroke="rgba(255,255,255,.08)" strokeDasharray="2 7" />
            <circle cx="100" cy="21" r="3" fill="#D8B45C" />
          </svg>
          <span className="serif relative text-[clamp(59px,6.6vw,91.8px)] leading-none tracking-[-0.02em] text-[var(--gold)] transition-transform duration-600 ease-[cubic-bezier(0.2,0.7,0.1,1)] motion-safe:group-hover:scale-105">
            {initials(person.fullName)}
          </span>
          <span className="caps absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-[9.5px] tracking-[0.06em] text-[#062a14] backdrop-blur-md dark:bg-[rgba(6,42,20,0.65)] dark:text-white/90">
            {badgeLabel}
          </span>
        </div>
      )}

      <div className="flex flex-1 flex-col items-start gap-2 p-5">
        <span className="caps inline-flex items-center rounded-full bg-[var(--accent)] px-2.5 py-0.5 text-[10.5px] font-semibold leading-normal text-[var(--primary)]">
          {person.roleTitle}
        </span>
        <h3 className="serif m-0 text-[24px] leading-[1.15] font-normal text-[var(--ink)]">{person.fullName}</h3>
        {departmentName ? (
          <p className="m-0 text-[13.5px] text-[var(--muted)]">
            Department of {departmentName}
          </p>
        ) : null}

        <div className="mt-auto w-full pt-3.5 border-t border-[var(--rule-soft)] flex items-center justify-between gap-3">
          <span className="caps text-[10px] text-[var(--muted)]">
            Session {person.sessionSlug}
          </span>
        </div>
      </div>
    </article>
  );
}
