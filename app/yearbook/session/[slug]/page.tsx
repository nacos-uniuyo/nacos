import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { HeroOrbits } from "@/components/Orbits";
import { SessionCohortGrid } from "@/components/SessionCohortGrid";
import { breadcrumbSchema, yearbookCollectionSchema } from "@/lib/schema";
import { ogDefaults } from "@/lib/site";
import { appRouter } from "@/server/routers";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const caller = appRouter.createCaller({ session: null });
  const sessions = await caller.session.list();
  return sessions.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const caller = appRouter.createCaller({ session: null });
  const session = await caller.session.bySlug({ slug });

  if (!session) {
    return { title: "Cohort Not Found" };
  }

  const title = `${session.name} · Graduating Cohort`;
  const description = `Honoured graduating class of ${session.name} from the Faculty of Computing, University of Uyo.`;

  return {
    title,
    description,
    keywords: [
      session.name,
      "Faculty of Computing graduating class",
      "University of Uyo alumni",
      "computing cohort",
      "digital yearbook UNIUYO",
    ],
    alternates: { canonical: `/yearbook/session/${session.slug}` },
    openGraph: {
      ...ogDefaults,
      url: `/yearbook/session/${session.slug}`,
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

export default async function SessionCohortPage({ params }: Props) {
  const { slug } = await params;
  const caller = appRouter.createCaller({ session: null });

  const [session, departments, allAlumni] = await Promise.all([
    caller.session.bySlug({ slug }),
    caller.department.list(),
    caller.roster.alumni(),
  ]);

  if (!session) {
    notFound();
  }

  const cohortAlumni = allAlumni.filter((a) => a.sessionSlug === session.slug);
  const deptMap = new Map(departments.map((d) => [d.slug, d.name]));

  return (
    <>
      <section className="page-hero" aria-labelledby="cohort-hero-title">
        <div className="grid-bg drift" aria-hidden="true" />
        <HeroOrbits label={`{ ${session.name.replace(" Academic Session", "").toUpperCase()} }`} />

        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link href="/">NACOS UNIUYO</Link>
              </li>
              <li>
                <Link href="/yearbook">Yearbook &amp; Alumni</Link>
              </li>
              <li aria-current="page">{session.name}</li>
            </ol>
          </nav>

          <div className="flex flex-wrap items-center gap-2.5 text-xs text-[var(--mint-2)]">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] text-[var(--mint-2)] font-semibold">
              <GraduationCap size={13} className="text-[var(--gold)]" />
              <span>{session.name.replace(" Academic Session", " Cohort")}</span>
            </span>
            {session.theme && (
              <>
                <span className="opacity-40" aria-hidden="true">·</span>
                <span className="caps text-[var(--gold)] font-medium">
                  &ldquo;{session.theme}&rdquo;
                </span>
              </>
            )}
          </div>

          <h1
            id="cohort-hero-title"
            className="serif text-white max-w-[65%] max-lg:max-w-none text-[clamp(44px,6.5vw,96px)] leading-[0.96]"
          >
            {session.name}
          </h1>

          <p className="max-w-[580px] text-[var(--mint-2)] font-medium text-[clamp(16px,1.6vw,19px)] leading-relaxed">
            Honoured graduating class, valedictorians, and student innovators who completed their computing
            degrees during this academic tenure at the University of Uyo.
          </p>

          <div className="pt-2">
            <Link
              href="/yearbook"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--gold)] hover:text-white transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to all yearbook sets</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-[var(--section-y)]" aria-label="Cohort Graduate Directory">
        <div className="wrap">
          <Suspense fallback={null}>
            <SessionCohortGrid
              cohortAlumni={cohortAlumni}
              departments={departments}
              session={session}
            />
          </Suspense>
        </div>
      </section>

      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "NACOS UNIUYO", path: "/" },
            { name: "Yearbook & Alumni", path: "/yearbook" },
            { name: session.name, path: `/yearbook/session/${session.slug}` },
          ]),
          yearbookCollectionSchema(
            cohortAlumni.map((a) => ({
              fullName: a.fullName,
              slug: a.slug,
              roleTitle: a.roleTitle,
              departmentName: a.departmentSlug ? deptMap.get(a.departmentSlug) : null,
            })),
          ),
        ]}
      />
    </>
  );
}
