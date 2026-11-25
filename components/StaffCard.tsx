import Image from "next/image";
import Link from "next/link";
import { initials } from "@/lib/executives";
import type { PersonSummary } from "@/server/contracts";

const SIZES = "(max-width: 680px) 100vw, (max-width: 1024px) 50vw, 360px";

type Props = {
  person: PersonSummary;
  index: number;
  priority?: boolean;
  departmentName?: string | null;
};

export function StaffCard({ person, index, priority, departmentName }: Props) {
  const displayDepartment = departmentName ? `Department of ${departmentName}` : "Faculty of Computing";

  return (
    <article className="group/staff relative flex flex-col tile rounded-2xl border border-[var(--rule)] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300">
      <div className="relative aspect-[4/3] w-full bg-[var(--forest)] overflow-hidden">
        {person.photoUrl ? (
          <Image
            src={person.photoUrl}
            alt={`${person.fullName}, ${person.roleTitle}`}
            fill
            sizes={SIZES}
            priority={priority}
            className="object-cover group-hover/staff:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${index % 2 ? "bg-[var(--forest-2)]" : "bg-[var(--forest)]"}`} aria-hidden="true">
            <span className="serif text-5xl text-[var(--gold)]">{initials(person.fullName)}</span>
          </div>
        )}
      </div>

      <div className="p-6 sm:p-7 flex flex-col gap-1.5 flex-1 justify-center">
        <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--gold-dark,rgb(161,114,24))] font-semibold">
          {person.roleTitle}
        </span>
        <h3 className="serif text-xl sm:text-2xl text-[var(--ink)] m-0 leading-snug">
          <Link
            href={`/staff/${person.slug}`}
            className="before:absolute before:inset-0 before:z-10 text-inherit no-underline hover:text-primary transition-colors"
          >
            {person.fullName}
          </Link>
        </h3>
        <p className="text-xs text-[var(--muted)] m-0">
          {displayDepartment}
        </p>
      </div>
    </article>
  );
}
