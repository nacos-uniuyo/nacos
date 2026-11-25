import Image from "next/image";
import { initials } from "@/lib/executives";
import type { PersonSummary } from "@/server/contracts";

const SIZES = "(max-width: 680px) 46vw, (max-width: 1100px) 31vw, 300px";

type Props = {
  person: PersonSummary;
  index: number;
  priority?: boolean;
  sessionName?: string;
};

export function CouncilPersonCard({ person, index, priority, sessionName }: Props) {
  const sessionTag = sessionName ? sessionName.replace(" Academic Session", "") : "Council";

  return (
    <article
      className="group relative flex h-full flex-col rounded-[26px] tile p-3.5 shadow-[0_2px_10px_rgba(6,42,20,0.06)] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.2,0.7,0.1,1)]"
      id={person.slug}
    >
      {person.photoUrl ? (
        <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] bg-[var(--forest)]">
          <Image
            src={person.photoUrl}
            alt={`${person.fullName}, ${person.roleTitle}`}
            fill
            sizes={SIZES}
            priority={priority}
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.2,0.7,0.1,1)] motion-safe:group-hover:scale-[1.06]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(6,42,20,0.55)] via-transparent to-transparent" />
          <div
            className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-900 ease-out motion-safe:group-hover:translate-x-[400%]"
            aria-hidden="true"
          />
          <span className="caps absolute left-3 top-3 rounded-full bg-[rgba(6,42,20,0.45)] px-2.5 py-1 text-[9.5px] text-white/90 backdrop-blur-sm" aria-hidden="true">
            {sessionTag}
          </span>
        </div>
      ) : (
        <div
          className={`relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-[18px] text-white ${
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
          <span className="caps absolute left-3 top-3 rounded-full bg-[rgba(6,42,20,0.45)] px-2.5 py-1 text-[9.5px] text-white/75 backdrop-blur-sm">
            {sessionTag}
          </span>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-1.5 px-2 pt-4 pb-2">
        <span className="caps text-[11px] leading-normal text-[var(--green)]">{person.roleTitle}</span>
        <h3 className="serif m-0 text-[clamp(24px,2.2vw,30px)] leading-[1.1] font-normal text-[var(--ink)]">{person.fullName}</h3>
      </div>
    </article>
  );
}
