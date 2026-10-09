import Link from "next/link";
import { to12h, type NacosEvent, type ProgrammeItem } from "@/lib/events";

/** Moments in the programme that get a filled node on the timeline. */
const KEY_MOMENTS = /Processional|Oath|Official Inauguration|Inaugural Address/;

export function Timeline({ items }: { items: ProgrammeItem[] }) {
  return (
    <ol className="timeline">
      {items.map((it) => (
        <li key={it.time + it.title} className={KEY_MOMENTS.test(it.title) ? "key reveal" : "reveal"}>
          <time dateTime={it.time}>{to12h(it.time)}</time>
          <span className="node" aria-hidden="true" />
          <h3 className="serif">{it.title}</h3>
        </li>
      ))}
    </ol>
  );
}

export function Breadcrumbs({ items }: { items: { name: string; path?: string }[] }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((it) => (
          <li key={it.name}>
            {it.path ? <Link href={it.path}>{it.name}</Link> : <span aria-current="page">{it.name}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function EventSubnav({ e, active }: { e: NacosEvent; active: "overview" | "programme" }) {
  const base = `/events/${e.slug}`;
  return (
    <nav className="subnav" aria-label="Event sections">
      <div className="wrap">
        <ul>
          <li>
            <Link href={base} aria-current={active === "overview" ? "page" : undefined}>
              Overview
            </Link>
          </li>
          <li>
            <Link href={`${base}/programme`} aria-current={active === "programme" ? "page" : undefined}>
              Programme
            </Link>
          </li>
          <li>
            <Link href={`${base}#council`}>The Council</Link>
          </li>
          <li>
            <Link href={`${base}#venue`}>Venue</Link>
          </li>
          <li>
            <a href={`${base}/calendar.ics`} download>
              Add to calendar
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
