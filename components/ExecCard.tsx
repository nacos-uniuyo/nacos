import Image from "next/image";
import { initials, type Executive } from "@/lib/executives";

const SIZES = "(max-width: 680px) 46vw, (max-width: 1100px) 31vw, 300px";

export function ExecCard({ exec, index, priority }: { exec: Executive; index: number; priority?: boolean }) {
  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-[22px] border border-[var(--rule)] bg-[var(--sand)] shadow-[0_4px_20px_-4px_rgba(25,51,34,0.08)] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.2,0.7,0.1,1)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.35)]"
      id={exec.slug}
    >
      {exec.photo ? (
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--forest)]">
          <Image
            src={exec.photo}
            alt={`${exec.name}, ${exec.role}`}
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
        </div>
      ) : (
        <div
          className={`relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden text-white ${
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
            {initials(exec.name)}
          </span>
        </div>
      )}

      <div className="flex flex-1 flex-col items-start gap-2 p-5">
        <span className="caps inline-flex items-center rounded-full bg-[var(--accent)] px-2.5 py-0.5 text-[10.5px] font-semibold leading-normal text-[var(--primary)]">
          {exec.role}
        </span>
        <h3 className="serif m-0 text-[clamp(21px,1.9vw,26px)] leading-[1.15] font-normal text-[var(--ink)]">{exec.name}</h3>
      </div>
    </article>
  );
}
