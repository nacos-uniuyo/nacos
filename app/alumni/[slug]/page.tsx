import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, GithubIcon, QuoteMark, UniuyoCrest } from "@/components/icons";
import { JsonLd } from "@/components/JsonLd";
import { HeroOrbits } from "@/components/Orbits";
import { RichTextRenderer } from "@/components/RichTextRenderer";
import type { RoleTier } from "@/lib/enums";
import { initials } from "@/lib/executives";
import { breadcrumbSchema } from "@/lib/schema";
import { ogDefaults, site } from "@/lib/site";
import type { PersonSummary } from "@/server/contracts";
import { appRouter } from "@/server/routers";

const TIER_DISPLAY_LABELS: Record<RoleTier, string> = {
  alumni: "Graduating Class · Alumni",
  elected_exco: "Elected Executive Council",
  dev_team: "Software & Dev Team",
  aide: "Executive Aide",
};

function getMemberQuote(person: PersonSummary, deptName?: string) {
  if (person.tier === "alumni") {
    return `Graduating from the Department of ${deptName ?? "Computing"} at the University of Uyo with a commitment to rigorous engineering and mentorship for rising cohorts.`;
  }
  if (person.tier === "elected_exco") {
    return `Serving the Nigeria Association of Computing Students (NACOS UNIUYO) as ${person.roleTitle}, advancing transparency, academic excellence, and student innovation.`;
  }
  if (person.tier === "dev_team") {
    return `Engineering permanent digital infrastructure for the Faculty of Computing as ${person.roleTitle} during the ${person.sessionSlug} session.`;
  }
  return `Supporting chapter administration and student documentation as ${person.roleTitle} in the ${person.sessionSlug} academic session.`;
}

function getMemberHonours(person: PersonSummary) {
  if (person.tier === "alumni") {
    return "B.Sc. Honours · Graduating Cohort Fellow";
  }
  if (person.tier === "elected_exco") {
    return "4th Executive Council · Meritorious Service";
  }
  if (person.tier === "dev_team") {
    return "Software Directorate · Core Systems Engineer";
  }
  return "Executive Secretariat · Chapter Citation";
}

type Props = {
  params: Promise<{ slug: string }>;
};

async function getAllRosterRecords() {
  const caller = appRouter.createCaller({ session: null });
  const [sessions, departments] = await Promise.all([
    caller.session.list(),
    caller.department.list(),
  ]);
  const perSession = await Promise.all(
    sessions.map((s) => caller.roster.bySession({ sessionSlug: s.slug })),
  );
  return {
    sessions,
    departments,
    records: perSession.flat(),
  };
}

export async function generateStaticParams() {
  const { records } = await getAllRosterRecords();
  const uniqueSlugs = Array.from(new Set(records.map((r) => r.slug)));
  return uniqueSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { records, departments } = await getAllRosterRecords();
  const person = records.find((r) => r.slug === slug);

  if (!person) {
    return { title: "Profile Not Found" };
  }

  const dept = departments.find((d) => d.slug === person.departmentSlug);
  const title = `${person.fullName} · ${person.roleTitle}`;
  const description = `${person.fullName} (${person.roleTitle}, ${dept ? `Department of ${dept.name}` : "Faculty of Computing"}) in the NACOS UNIUYO Digital Yearbook & Alumni Archive.`;

  return {
    title,
    description,
    alternates: { canonical: `/alumni/${person.slug}` },
    openGraph: {
      ...ogDefaults,
      url: `/alumni/${person.slug}`,
      title: `${title} | NACOS UNIUYO`,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | NACOS UNIUYO`,
      description,
    },
  };
}

export default async function AlumniProfilePage({ params }: Props) {
  const { slug } = await params;
  const { records, sessions, departments } = await getAllRosterRecords();

  const matchingRoles = records.filter((r) => r.slug === slug);
  const primary = matchingRoles[0];

  if (!primary) {
    notFound();
  }

  const dept = departments.find((d) => d.slug === primary.departmentSlug) ?? null;
  const sessionMap = new Map(sessions.map((s) => [s.slug, s]));
  const primarySession = sessionMap.get(primary.sessionSlug);

  const honours = getMemberHonours(primary);
  const quote = getMemberQuote(primary, dept?.name);

  const biographyText = `${primary.fullName} is a verified member of the ${dept ? `Department of ${dept.name} (${dept.shortName})` : "Faculty of Computing"} at the University of Uyo, recorded in the ${primarySession?.name ?? primary.sessionSlug} archive as ${primary.roleTitle} (${TIER_DISPLAY_LABELS[primary.tier]}).\n\n${quote}`;

  const peerProfiles = records
    .filter((r) => r.slug !== primary.slug && (r.departmentSlug === primary.departmentSlug || r.sessionSlug === primary.sessionSlug))
    .slice(0, 3);

  return (
    <>
      <section className="page-hero dept-hero" aria-labelledby="profile-hero-title">
        <div className="grid-bg drift" aria-hidden="true" />
        <HeroOrbits label={`{ ${dept?.shortName ?? "UNIUYO"} · ${primary.sessionSlug} }`} />

        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/yearbook">Yearbook</Link>
              </li>
              <li>
                <Link href="/alumni">Alumni</Link>
              </li>
              <li aria-current="page">{primary.fullName}</li>
            </ol>
          </nav>

          <div className="profile-hero-layout">
            <div className="profile-hero-avatar">
              {primary.photoUrl ? (
                <Image
                  src={primary.photoUrl}
                  alt={primary.fullName}
                  fill
                  sizes="220px"
                  className="object-cover"
                  priority
                />
              ) : (
                <span className="serif text-6xl text-[var(--gold)]">{initials(primary.fullName)}</span>
              )}
            </div>

            <div className="profile-hero-meta">
              <div className="dept-hero-badges">
                <span className="caps dept-shortcode-pill">
                  <UniuyoCrest size={18} />
                  <span>{TIER_DISPLAY_LABELS[primary.tier]}</span>
                </span>
                {dept ? (
                  <Link href={`/departments/${dept.slug}`} className="caps dept-faculty-tag no-underline">
                    {dept.shortName} · Department of {dept.name}
                  </Link>
                ) : null}
                <span className="caps dept-faculty-tag">Session {primary.sessionSlug}</span>
              </div>

              <h1 id="profile-hero-title" className="serif">
                {primary.fullName}
              </h1>

              <p className="text-lg text-[var(--mint-2)]">
                {primary.roleTitle} · {honours}
              </p>

              {/* Verified Professional Links */}
              <div className="cta-row pt-2">
                <a
                  href={`https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(`${primary.fullName} University of Uyo`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-solid btn-sm"
                >
                  <span>LinkedIn Profile</span>
                  <ArrowRight size={15} />
                </a>
                <a
                  href={site.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm"
                >
                  <GithubIcon size={16} />
                  <span>GitHub</span>
                </a>
                <Link href={`/alumni/${primary.slug}`} className="btn btn-ghost btn-sm">
                  Portfolio Record
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-[var(--section-y)]" aria-label="Member Biography and Session Record">
        <div className="wrap">
          <div className="dept-overview-grid">
            {/* Biography & Personal Quote */}
            <div className="dept-panel-stack">
              <div className="dept-overview-card">
                <span className="caps eyebrow accent">Personal Yearbook Quote</span>
                <div className="deans-message-prose">
                  <span className="deans-watermark-quote" aria-hidden="true">
                    <QuoteMark size={36} />
                  </span>
                  <p className="serif m-0 text-2xl leading-snug text-[var(--ink)] sm:text-3xl">
                    &ldquo;{quote}&rdquo;
                  </p>
                </div>

                <hr className="my-2 border-t border-[var(--rule)]" />

                <span className="caps eyebrow accent">Institutional Biography</span>
                <h2 className="serif text-3xl">Academic &amp; Leadership Record</h2>
                <RichTextRenderer
                  doc={biographyText}
                  className="text-[16.5px] leading-relaxed text-[var(--ink)]"
                />
              </div>

              {/* Session Roles History */}
              <div className="dept-overview-card">
                <span className="caps eyebrow accent">Temporal Appointments (session_role)</span>
                <h2 className="serif text-3xl">Academic Session Roles Held</h2>
                <div className="flex flex-col gap-3 pt-2">
                  {matchingRoles.map((role, i) => {
                    const sess = sessionMap.get(role.sessionSlug);
                    const roleDept = departments.find((d) => d.slug === role.departmentSlug);
                    return (
                      <div key={`${role.sessionSlug}-${role.roleTitle}-${i}`} className="dept-pillar-box">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="caps text-[10px] text-[var(--green)]">
                            {sess ? sess.name : role.sessionSlug}
                          </span>
                          <span className="caps rounded-full bg-white px-2.5 py-0.5 text-[10px] text-[var(--forest)]">
                            {TIER_DISPLAY_LABELS[role.tier]}
                          </span>
                        </div>
                        <h3 className="serif text-2xl">{role.roleTitle}</h3>
                        <p className="text-xs text-[var(--muted)]">
                          {roleDept ? `Department of ${roleDept.name} (${roleDept.shortName})` : "Faculty Central"} ·{" "}
                          {honours}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Sidebar: Profile Verification & Claim */}
            <aside className="dept-panel-stack" aria-label="Profile Details">
              <div className="dept-overview-card">
                <span className="caps eyebrow accent">Yearbook Dossier</span>
                <h3 className="serif text-3xl">Verified Details</h3>

                <dl className="project-spec-list">
                  <div className="project-spec-row">
                    <dt className="caps">Full Name</dt>
                    <dd className="font-semibold text-[var(--ink)]">{primary.fullName}</dd>
                  </div>
                  <div className="project-spec-row">
                    <dt className="caps">Current Role / Office</dt>
                    <dd>{primary.roleTitle}</dd>
                  </div>
                  <div className="project-spec-row">
                    <dt className="caps">Institution / Company</dt>
                    <dd>Faculty of Computing, University of Uyo</dd>
                  </div>
                  <div className="project-spec-row">
                    <dt className="caps">Department</dt>
                    <dd>
                      {dept ? (
                        <Link href={`/departments/${dept.slug}`} className="font-semibold text-[var(--green)]">
                          {dept.name} ({dept.shortName})
                        </Link>
                      ) : (
                        "Faculty of Computing"
                      )}
                    </dd>
                  </div>
                  <div className="project-spec-row">
                    <dt className="caps">Academic Session</dt>
                    <dd>{primarySession?.name ?? primary.sessionSlug}</dd>
                  </div>
                  <div className="project-spec-row">
                    <dt className="caps">Honours</dt>
                    <dd>{honours}</dd>
                  </div>
                </dl>

                <div className="rounded-2xl bg-[var(--paper)] p-4">
                  <p className="caps m-0 text-[10px] text-[var(--green)]">Are you {primary.fullName}?</p>
                  <p className="mt-1 mb-3 text-xs leading-relaxed text-[var(--muted)]">
                    Sign in with Google to claim this record, update your current company, and attach your personal
                    social links.
                  </p>
                  <Link href="/login" className="btn btn-dark btn-sm w-full">
                    Claim This Profile
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </aside>
          </div>

          {/* Peer Profiles */}
          {peerProfiles.length > 0 ? (
            <div className="mt-20">
              <div className="section-head mb-8">
                <div>
                  <span className="caps eyebrow accent">Cohort Peers</span>
                  <h2 className="serif text-4xl">Fellow Cohort &amp; Department Members</h2>
                </div>
                <Link href="/yearbook" className="text-link">
                  Back to Digital Yearbook
                  <ArrowRight />
                </Link>
              </div>

              <ul className="dept-person-grid">
                {peerProfiles.map((peer) => {
                  const peerDept = departments.find((d) => d.slug === peer.departmentSlug);
                  return (
                    <li key={peer.slug} className="dept-person-card">
                      <div className="dept-person-media">
                        {peer.photoUrl ? (
                          <Image
                            src={peer.photoUrl}
                            alt={peer.fullName}
                            fill
                            sizes="320px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="dept-person-monogram" aria-hidden="true">
                            <span className="serif">{initials(peer.fullName)}</span>
                          </div>
                        )}
                        <span className="caps dept-person-tier-badge">{peer.sessionSlug}</span>
                      </div>
                      <div className="dept-person-body">
                        <span className="caps dept-person-role">{peer.roleTitle}</span>
                        <h3 className="serif dept-person-name">{peer.fullName}</h3>
                        <p className="dept-person-dept">
                          {peerDept ? `Dept. of ${peerDept.name}` : "Faculty of Computing"}
                        </p>
                        <div className="dept-person-socials">
                          <span className="caps text-[10px] text-[var(--muted)]">
                            {TIER_DISPLAY_LABELS[peer.tier]}
                          </span>
                          <Link href={`/alumni/${peer.slug}`} className="text-link text-xs">
                            View Profile
                            <ArrowRight size={13} />
                          </Link>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Yearbook", path: "/yearbook" },
          { name: primary.fullName, path: `/alumni/${primary.slug}` },
        ])}
      />
    </>
  );
}
