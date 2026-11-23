import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Building2, Mail, MapPin } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { HeroOrbits } from "@/components/Orbits";
import { SocialIconList } from "@/components/SocialIconList";
import { StaffCard } from "@/components/StaffCard";
import { breadcrumbSchema, personSchema } from "@/lib/schema";
import { ogDefaults } from "@/lib/site";
import { appRouter } from "@/server/routers";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const caller = appRouter.createCaller({ session: null });
  const staff = await caller.roster.staff();
  return staff.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const caller = appRouter.createCaller({ session: null });
  const [person, departments] = await Promise.all([
    caller.roster.bySlug({ slug }),
    caller.department.list(),
  ]);

  if (!person || person.tier !== "staff") {
    return { title: "Staff Profile Not Found" };
  }

  const dept = departments.find((d) => d.slug === person.departmentSlug);
  const deptName = dept ? `Department of ${dept.name}` : "Faculty of Computing";
  const title = `${person.fullName} · ${person.roleTitle}`;
  const description = `${person.fullName}, ${person.roleTitle} at the ${deptName}, University of Uyo.`;

  return {
    title,
    description,
    keywords: [
      person.fullName,
      person.roleTitle,
      deptName,
      "NACOS UNIUYO staff",
      "University of Uyo computing faculty",
      "staff directory UNIUYO",
    ],
    alternates: { canonical: `/staff/${person.slug}` },
    openGraph: {
      ...ogDefaults,
      title: `${title} · NACOS UNIUYO`,
      description,
      url: `/staff/${person.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · NACOS UNIUYO`,
      description,
    },
  };
}

export default async function StaffProfilePage({ params }: Props) {
  const { slug } = await params;
  const caller = appRouter.createCaller({ session: null });
  const [person, departments, otherStaff] = await Promise.all([
    caller.roster.bySlug({ slug }),
    caller.department.list(),
    caller.roster.staff(),
  ]);

  if (!person || person.tier !== "staff") {
    notFound();
  }

  const dept = departments.find((d) => d.slug === person.departmentSlug);
  const colleagues = otherStaff.filter((s) => s.slug !== person.slug).slice(0, 3);

  return (
    <>
      <section className="relative bg-[var(--forest)] text-white overflow-hidden min-h-[min(780px,calc(100svh-80px))] flex items-center py-[clamp(64px,8vw,100px)]" aria-labelledby="staff-profile-title">
        <div className="grid-bg drift" aria-hidden="true" />
        <HeroOrbits label="{ FACULTY PROFILE }" />

        <div className="wrap relative flex flex-col gap-6 w-full">
          <nav aria-label="Breadcrumb">
            <ol className="list-none flex flex-wrap items-center gap-2 m-0 p-0 text-[13px] text-white/75 [&_li+li]:before:content-['/'] [&_li+li]:before:mr-2 [&_li+li]:before:text-white/35 [&_a]:text-white/75 [&_a:hover]:text-white [&_[aria-current]]:text-white [&_[aria-current]]:font-medium">
              <li>
                <Link
                  href="/"
                  className="text-white/75 hover:text-white transition-colors no-underline"
                >
                  NACOS UNIUYO
                </Link>
              </li>
              <li>
                <Link
                  href="/staff"
                  className="text-white/75 hover:text-white transition-colors no-underline"
                >
                  Staff Directory
                </Link>
              </li>
              <li aria-current="page">{person.fullName}</li>
            </ol>
          </nav>

          <div className="flex flex-wrap items-center gap-2.5 text-xs text-[var(--mint-2)]">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] text-[var(--mint-2)] font-semibold">
              <Building2 size={13} className="text-[var(--gold)]" />
              <span>{dept ? `Department of ${dept.name}` : "Faculty of Computing"}</span>
            </span>
          </div>

          <h1
            id="staff-profile-title"
            className="serif text-white max-w-[70%] max-lg:max-w-none text-[clamp(40px,5vw,80px)] leading-[1.02]"
          >
            {person.fullName}
          </h1>

          <p className="max-w-[620px] text-[var(--mint-2)] font-medium text-[clamp(16px,1.6vw,19px)] leading-relaxed mt-2 mb-0">
            {person.roleTitle}
          </p>
        </div>
      </section>

      <section className="py-[var(--section-y)]" aria-label="Staff Details and Background">
        <div className="wrap relative flex flex-col gap-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-12 sm:gap-16 items-start">
            {/* Sidebar with portrait and official details */}
            <aside className="flex flex-col gap-6 p-6 sm:p-8 bg-white rounded-2xl border border-[rgba(15,26,19,0.12)] shadow-sm">
              <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-[var(--forest)]">
                {person.photoUrl ? (
                  <Image
                    src={person.photoUrl}
                    alt={person.fullName}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 340px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl serif text-[var(--gold)]">
                    {person.fullName.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4 text-sm text-[var(--ink)]">
                {person.email && (
                  <div className="flex items-start gap-3">
                    <Mail size={16} className="text-[var(--gold-dark,rgb(161,114,24))] shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-mono uppercase text-[var(--muted)]">Institutional Email</span>
                      <a
                        href={`mailto:${person.email}`}
                        className="text-[var(--forest)] font-medium hover:underline break-all"
                      >
                        {person.email}
                      </a>
                    </div>
                  </div>
                )}

                {person.officeLocation && (
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-[var(--gold-dark,rgb(161,114,24))] shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-mono uppercase text-[var(--muted)]">Office Location</span>
                      <span className="text-[var(--ink)]">{person.officeLocation}</span>
                    </div>
                  </div>
                )}

                {person.socials && person.socials.length > 0 && (
                  <div className="pt-2 border-t border-[rgba(15,26,19,0.08)]">
                    <span className="text-[11px] font-mono uppercase text-[var(--muted)] block mb-2">Connect</span>
                    <SocialIconList socials={person.socials} />
                  </div>
                )}
              </div>
            </aside>

            {/* Content column */}
            <div className="flex flex-col gap-10">
              {person.quote && (
                <blockquote className="serif text-xl sm:text-2xl text-[var(--forest)] italic border-l-2 border-[var(--gold)] pl-6 py-2 m-0 bg-[rgba(6,42,20,0.02)] rounded-r-xl">
                  &ldquo;{person.quote}&rdquo;
                </blockquote>
              )}

              {person.bio && (
                <section className="flex flex-col gap-4">
                  <h2 className="serif text-2xl text-[var(--ink)] m-0">About &amp; Responsibilities</h2>
                  <p className="text-[16px] leading-relaxed text-[var(--muted)] m-0">{person.bio}</p>
                </section>
              )}

              {person.researchAreas && person.researchAreas.length > 0 && (
                <section className="flex flex-col gap-4 pt-4 border-t border-[rgba(15,26,19,0.08)]">
                  <div className="flex items-center gap-2">
                    <BookOpen size={18} className="text-[var(--forest)]" />
                    <h2 className="serif text-2xl text-[var(--ink)] m-0">Focus &amp; Specialization Areas</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {person.researchAreas.map((area) => (
                      <span
                        key={area}
                        className="px-3 py-1 rounded-md bg-[rgba(6,42,20,0.05)] border border-[rgba(6,42,20,0.12)] text-xs font-mono text-[var(--forest)]"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {colleagues.length > 0 && (
                <section className="flex flex-col gap-6 pt-6 border-t border-[rgba(15,26,19,0.08)]">
                  <h2 className="serif text-2xl text-[var(--ink)] m-0">Other Faculty Staff</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {colleagues.map((colleague, index) => {
                      const colleagueDept = departments.find((d) => d.slug === colleague.departmentSlug);
                      return (
                        <StaffCard
                          key={colleague.slug}
                          person={colleague}
                          index={index}
                          departmentName={colleagueDept ? colleagueDept.name : null}
                        />
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </section>

      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "NACOS UNIUYO", path: "/" },
            { name: "Staff", path: "/staff" },
            { name: person.fullName, path: `/staff/${person.slug}` },
          ]),
          personSchema({
            fullName: person.fullName,
            slug: person.slug,
            roleTitle: person.roleTitle,
            photoUrl: person.photoUrl,
            departmentName: dept?.name,
            basePath: "/staff",
            isAlumni: false,
          }),
        ]}
      />
    </>
  );
}
