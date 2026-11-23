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
      className="group flex flex-col h-full bg-[var(--paper)] rounded-[var(--radius)] overflow-hidden shadow-sm transition-all duration-450 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_rgba(6,42,20,0.14)]"
      id={person.slug}
    >
      {person.photoUrl ? (
        <div className="relative aspect-[4/5] bg-[var(--forest)] overflow-hidden">
          <Image
            src={person.photoUrl}
            alt={`${person.fullName}, ${person.roleTitle}`}
            fill
            sizes={SIZES}
            priority={priority}
            className="object-cover transition-all duration-800 ease-[cubic-bezier(0.2,0.7,0.1,1)] group-hover:scale-105 group-hover:saturate-110"
          />
          <div className="absolute inset-x-0 bottom-0 h-[32%] bg-gradient-to-t from-[rgba(6,42,20,0.6)] to-transparent pointer-events-none" />
          <span className="absolute left-4.5 bottom-4 text-[10px] text-white/80 caps z-1" aria-hidden="true">
            {sessionTag}
          </span>
        </div>
      ) : (
        <div
          className={`relative aspect-[4/5] overflow-hidden flex items-center justify-center text-white ${
            index % 2 ? "bg-[var(--forest-2)]" : "bg-[var(--forest)]"
          }`}
          aria-hidden="true"
        >
          <svg className="absolute inset-0 size-full" viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice">
            <circle cx="100" cy="125" r="78" fill="none" stroke="rgba(216,180,92,.35)" />
            <circle cx="100" cy="125" r="104" fill="none" stroke="rgba(255,255,255,.08)" strokeDasharray="2 7" />
            <circle cx="100" cy="21" r="3" fill="#D8B45C" />
          </svg>
          <span className="serif relative text-[clamp(72px,8vw,112px)] leading-none tracking-[-0.02em] text-[var(--gold)] transition-transform duration-600 group-hover:scale-105">
            {initials(person.fullName)}
          </span>
          <span className="caps absolute left-4.5 bottom-4 text-[10px] text-white/55">{sessionTag}</span>
        </div>
      )}
      <div className="p-5.5 sm:pb-6.5 flex flex-col gap-2">
        <span className="caps text-[11px] text-[var(--green)] leading-normal">{person.roleTitle}</span>
        <h3 className="serif m-0 font-normal text-[clamp(24px,2.2vw,30px)] leading-[1.1] text-[var(--ink)]">{person.fullName}</h3>
      </div>
    </article>
  );
}
