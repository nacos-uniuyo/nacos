import Link from "next/link";
import { to12h, type NacosEvent, type ProgrammeItem } from "@/lib/events";

/** Moments in the programme that get a filled node on the timeline. */
const KEY_MOMENTS = /Processional|Oath|Official Inauguration|Inaugural Address/;

export function Timeline({ items }: { items: ProgrammeItem[] }) {
  return (
    <ol className="relative list-none m-0 p-0 before:content-[''] before:absolute before:left-[104px] before:top-2.5 before:bottom-2.5 before:w-px before:bg-[rgba(15,26,19,0.14)] dark:before:bg-white/16">
      {items.map((it) => {
        const isKey = KEY_MOMENTS.test(it.title);
        return (
          <li
            key={it.time + it.title}
            className="grid grid-cols-[80px_48px_minmax(0,1fr)] py-3 items-start reveal"
          >
            <time dateTime={it.time} className="text-[15px] font-semibold tabular-nums pt-1 text-[var(--green)] dark:text-[var(--gold)] whitespace-nowrap">
              {to12h(it.time)}
            </time>
            <span
              className={`relative justify-self-center mt-2 size-2.5 rounded-full border-2 transition-all ${
                isKey
                  ? "bg-[var(--green)] border-[var(--green)] shadow-[0_0_0_6px_rgba(0,122,30,0.14)] dark:bg-[var(--gold)] dark:border-[var(--gold)] dark:shadow-[0_0_0_6px_rgba(216,180,92,0.16)]"
                  : "bg-[var(--paper)] border-[var(--green)] dark:bg-[var(--forest)] dark:border-[var(--gold)]"
              }`}
              aria-hidden="true"
            />
            <h3 className="serif m-0 font-normal text-[clamp(21px,2.1vw,27px)] leading-[1.2] text-[var(--ink)] dark:text-white">
              {it.title}
            </h3>
          </li>
        );
      })}
    </ol>
  );
}

export function Breadcrumbs({ items }: { items: { name: string; path?: string }[] }) {
  return (
    <nav className="mb-5" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-[13px] text-white/60">
        {items.map((it, index) => (
          <li key={it.name} className="flex items-center gap-2">
            {index > 0 ? (
              <span aria-hidden="true" className="text-white/40">
                /
              </span>
            ) : null}
            {it.path ? (
              <Link href={it.path} className="no-underline transition-colors hover:text-white">
                {it.name}
              </Link>
            ) : (
              <span aria-current="page" className="font-medium text-white">
                {it.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function EventSubnav({ e, active }: { e: NacosEvent; active: "overview" | "programme" }) {
  const base = `/events/${e.slug}`;
  return (
    <nav className="sticky top-[80px] z-20 bg-[var(--deep)]/95 backdrop-blur-md border-b border-white/6" aria-label="Event sections">
      <div className="wrap">
        <ul className="list-none m-0 p-0 flex gap-7 overflow-x-auto scrollbar-none">
          <li>
            <Link
              href={base}
              aria-current={active === "overview" ? "page" : undefined}
              className={`block py-4 text-sm font-medium whitespace-nowrap border-b-2 no-underline transition-colors ${
                active === "overview" ? "text-white border-b-[var(--gold)]" : "text-[var(--mint)] border-b-transparent hover:text-white"
              }`}
            >
              Overview
            </Link>
          </li>
          <li>
            <Link
              href={`${base}/programme`}
              aria-current={active === "programme" ? "page" : undefined}
              className={`block py-4 text-sm font-medium whitespace-nowrap border-b-2 no-underline transition-colors ${
                active === "programme" ? "text-white border-b-[var(--gold)]" : "text-[var(--mint)] border-b-transparent hover:text-white"
              }`}
            >
              Programme
            </Link>
          </li>
          <li>
            <Link href={`${base}#council`} className="block py-4 text-sm font-medium whitespace-nowrap border-b-2 border-b-transparent text-[var(--mint)] hover:text-white no-underline transition-colors">
              The Council
            </Link>
          </li>
          <li>
            <Link href={`${base}#venue`} className="block py-4 text-sm font-medium whitespace-nowrap border-b-2 border-b-transparent text-[var(--mint)] hover:text-white no-underline transition-colors">
              Venue
            </Link>
          </li>
          <li>
            <a href={`${base}/calendar.ics`} download className="block py-4 text-sm font-medium whitespace-nowrap border-b-2 border-b-transparent text-[var(--mint)] hover:text-white no-underline transition-colors">
              Add to calendar
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
