import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AlumniCard } from "@/components/AlumniCard";
import { Breadcrumbs } from "@/components/EventParts";
import { notFound } from "next/navigation";
import {
  Award,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  GraduationCap,
  Quote,
} from "lucide-react";
import { ArrowRight } from "@/components/icons";
import { JsonLd } from "@/components/JsonLd";
import { HeroOrbits } from "@/components/Orbits";
import { RichTextRenderer } from "@/components/RichTextRenderer";
import { SocialIconList } from "@/components/SocialIconList";
import { breadcrumbSchema, personSchema } from "@/lib/schema";
import { ogDefaults } from "@/lib/site";
import { appRouter } from "@/server/routers";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const caller = appRouter.createCaller({ session: null });
  const people = await caller.roster.list();
  return people.filter((p) => p.tier === "alumni").map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const caller = appRouter.createCaller({ session: null });
  const [person, departments] = await Promise.all([
    caller.roster.bySlug({ slug }),
    caller.department.list(),
  ]);

  if (!person || person.tier !== "alumni") {
    return { title: "Profile Not Found" };
  }

  const dept = departments.find((d) => d.slug === person.departmentSlug);
  const deptName = dept ? dept.name : "Faculty of Computing";
  const title = `${person.fullName} · ${person.roleTitle}`;
  const description = `${person.fullName}, ${person.roleTitle} from the Department of ${deptName}, Faculty of Computing, University of Uyo.`;

  return {
    title,
    description,
    keywords: [
      person.fullName,
      person.roleTitle,
      deptName,
      "NACOS UNIUYO alumni",
      "University of Uyo computing graduate",
      "digital yearbook UNIUYO",
    ],
    alternates: { canonical: `/yearbook/${person.slug}` },
    openGraph: {
      ...ogDefaults,
      url: `/yearbook/${person.slug}`,
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
  const caller = appRouter.createCaller({ session: null });

  const [person, departments, sessions, allAlumni] = await Promise.all([
    caller.roster.bySlug({ slug }),
    caller.department.list(),
    caller.session.list(),
    caller.roster.alumni(),
  ]);

  if (!person || person.tier !== "alumni") {
    notFound();
  }

  const dept = departments.find((d) => d.slug === person.departmentSlug) ?? null;
  const session = sessions.find((s) => s.slug === person.sessionSlug) ?? null;

  function getInitials(name: string): string {
    const parts = name.replace(/[^a-zA-Z\s]/g, "").trim().split(/\s+/);
    if (parts.length === 0 || !parts[0]) return "FC";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  const otherCohortMembers = allAlumni
    .filter((a) => a.slug !== person.slug && a.sessionSlug === person.sessionSlug)
    .slice(0, 3);

  return (
    <>
      <section className="relative flex min-h-[min(780px,calc(100svh-80px))] items-center overflow-hidden bg-[var(--deep)] py-[clamp(64px,8vw,100px)] text-white" aria-labelledby="alumni-profile-title">
        <div className="grid-bg drift" aria-hidden="true" />
        <HeroOrbits label={`{ ${session?.name?.replace(" Academic Session", "").toUpperCase() ?? "ALUMNI"} }`} />

        <div className="wrap relative flex w-full flex-col gap-6">
          <Breadcrumbs
            items={[
              { name: "NACOS UNIUYO", path: "/" },
              { name: "Yearbook & Alumni", path: "/yearbook" },
              { name: person.fullName },
            ]}
          />

          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-4 text-xs text-[var(--mint-2)]">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] text-[var(--mint-2)] font-semibold">
              <GraduationCap size={13} className="text-[var(--gold)]" />
              <span>{session?.name?.replace(" Academic Session", " Cohort") ?? "Alumnus"}</span>
            </span>

            {dept ? (
              <>
                <span className="opacity-40 max-sm:hidden" aria-hidden="true">·</span>
                <Link
                  href={`/departments/${dept.slug}`}
                  className="caps no-underline text-[var(--gold)] hover:text-white font-medium transition-colors max-sm:w-full max-sm:pt-1"
                >
                  Department of {dept.name}
                </Link>
              </>
            ) : null}
          </div>

          <h1
            id="alumni-profile-title"
            className="serif text-white max-w-[62%] max-lg:max-w-none text-[clamp(36.1px,4.9vw,75.4px)] leading-[0.98]"
          >
            {person.fullName}
          </h1>

          <p className="max-w-[580px] text-[var(--mint-2)] font-medium text-[clamp(16px,1.6vw,19px)] leading-relaxed mt-2 mb-0">
            {person.roleTitle}
          </p>
        </div>
      </section>

      <section className="py-[var(--section-y)]" aria-label="Alumni Biography and Credentials">
        <div className="wrap">
          <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-12 sm:gap-16 items-start">
            {/* Left Sidebar: Photo & Professional Info */}
            <aside className="lg:sticky lg:top-28 flex flex-col gap-6 p-6 sm:p-8 bg-[var(--sand)] rounded-xl border border-[var(--rule)] shadow-sm">
              <div className="relative aspect-[4/4.2] rounded-lg bg-[var(--forest)] overflow-hidden shadow-inner">
                {person.photoUrl ? (
                  <Image
                    src={person.photoUrl}
                    alt={person.fullName}
                    fill
                    className="object-cover"
                    sizes="360px"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center relative select-none">
                    <svg
                      viewBox="0 0 200 200"
                      className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
                      preserveAspectRatio="xMidYMid slice"
                      aria-hidden="true"
                    >
                      <circle cx="100" cy="100" r="70" stroke="rgba(216,180,92,0.6)" fill="none" />
                      <circle cx="100" cy="100" r="92" stroke="rgba(255,255,255,0.2)" strokeDasharray="3 6" fill="none" />
                      <circle cx="100" cy="30" r="4" fill="#D8B45C" />
                    </svg>
                    <span className="serif text-6xl text-[var(--gold)] font-normal tracking-wide">
                      {getInitials(person.fullName)}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <h2 className="serif text-2xl text-[var(--ink)] m-0">{person.fullName}</h2>
                <p className="text-xs font-semibold text-[var(--green)] mt-2.5 mb-0 leading-normal">
                  {person.roleTitle}
                </p>
              </div>

              <dl className="flex flex-col gap-4 text-xs sm:text-sm m-0 pt-2 border-t border-[rgba(15,26,19,0.08)]">
                <div className="flex flex-col gap-1 pb-3 border-b border-[rgba(15,26,19,0.08)]">
                  <dt className="text-[var(--muted)] font-medium flex items-center gap-1.5">
                    <Building2 size={14} className="text-[var(--green)]" />
                    <span>Department</span>
                  </dt>
                  <dd className="font-semibold text-[var(--ink)] m-0">
                    {dept ? `Department of ${dept.name}` : "Faculty of Computing"}
                  </dd>
                </div>

                <div className="flex flex-col gap-1 pb-3 border-b border-[rgba(15,26,19,0.08)]">
                  <dt className="text-[var(--muted)] font-medium flex items-center gap-1.5">
                    <Calendar size={14} className="text-[var(--green)]" />
                    <span>Graduating Session</span>
                  </dt>
                  <dd className="font-semibold text-[var(--ink)] m-0">
                    {session ? session.name : person.sessionSlug}
                  </dd>
                </div>

                {(person.currentRole || person.currentCompany) && (
                  <div className="flex flex-col gap-1 pb-3 border-b border-[rgba(15,26,19,0.08)]">
                    <dt className="text-[var(--muted)] font-medium flex items-center gap-1.5">
                      <Briefcase size={14} className="text-[var(--green)]" />
                      <span>Current Position</span>
                    </dt>
                    <dd className="font-semibold text-[var(--ink)] m-0">
                      {person.currentRole}
                      {person.currentRole && person.currentCompany ? ` at ${person.currentCompany}` : person.currentCompany}
                    </dd>
                  </div>
                )}
              </dl>

              {/* Alumni Profiles & Social Links */}
              {person.socials && person.socials.length > 0 && (
                <div className="flex flex-col gap-2.5 pt-2">
                  <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                    Contact &amp; Profiles
                  </span>
                  <SocialIconList socials={person.socials} size="md" />
                </div>
              )}
            </aside>

            {/* Right Main Column: Living Bio & Statement */}
            <div className="flex flex-col gap-10 min-w-0">
              {person.quote && (
                <div className="py-2 relative">
                  <Quote size={32} className="text-[var(--gold)] mb-3 opacity-75" />
                  <blockquote className="serif text-2xl sm:text-3xl text-[var(--ink)] leading-relaxed m-0 border-0 p-0">
                    &ldquo;{person.quote}&rdquo;
                  </blockquote>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mt-4 mb-0">
                    Yearbook Statement · {session?.name ?? person.sessionSlug}
                  </p>
                </div>
              )}

              <article className="prose-clean min-w-0">
                <h2>Alumni Reflection &amp; Academic Journey</h2>
                <p>
                  Graduated with honours from the Department of {dept ? dept.name : "Computing"} at the Faculty of
                  Computing, University of Uyo. During their tenure, they actively engaged in laboratory research,
                  software design, and student leadership within the NACOS community.
                </p>
                <p>
                  Their professional journey demonstrates the institutional rigor and practical capacity developed
                  at the University of Uyo, bridging academic research with industry-grade software engineering,
                  systems architecture, and data science.
                </p>

                <h3>Mentorship &amp; Industry Engagement</h3>
                <p>
                  Graduates in this directory contribute directly to the undergraduate
                  experience through SIWES internship sponsorships, technical hackathon evaluation, and direct career
                  mentorship for computing students.
                </p>
              </article>

              {/* Other Members from the Same Cohort */}
              {otherCohortMembers.length > 0 && (
                <div className="pt-8 flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                    <h3 className="serif text-xl sm:text-2xl text-[var(--ink)] m-0">
                      Classmates from {session?.name ?? person.sessionSlug}
                    </h3>
                    <Link
                      href={`/yearbook/session/${session?.slug ?? person.sessionSlug}`}
                      className="text-link text-xs font-semibold text-[var(--green)] hover:text-[var(--green)] transition-colors self-start sm:self-auto shrink-0 whitespace-nowrap"
                    >
                      <span>View entire class</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {otherCohortMembers.map((mate) => {
                      const mateDept = mate.departmentSlug
                        ? departments.find((d) => d.slug === mate.departmentSlug)?.name ?? null
                        : null;
                      return (
                        <AlumniCard
                          key={mate.slug}
                          alum={mate}
                          deptName={mateDept}
                          sessionName={session?.name ?? mate.sessionSlug}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "NACOS UNIUYO", path: "/" },
            { name: "Yearbook & Alumni", path: "/yearbook" },
            { name: person.fullName, path: `/yearbook/${person.slug}` },
          ]),
          personSchema({
            fullName: person.fullName,
            slug: person.slug,
            roleTitle: person.roleTitle,
            photoUrl: person.photoUrl,
            departmentName: dept?.name,
            sessionName: session?.name,
            currentRole: person.currentRole,
            currentCompany: person.currentCompany,
            linkedinUrl: person.linkedinUrl,
            githubUrl: person.githubUrl,
            portfolioUrl: person.portfolioUrl,
          }),
        ]}
      />
    </>
  );
}
