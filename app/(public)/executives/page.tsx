import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/EventParts";
import { ExecutivesInfiniteList } from "@/components/ExecutivesInfiniteList";
import { JsonLd } from "@/components/JsonLd";
import { HeroOrbits } from "@/components/Orbits";
import { breadcrumbSchema } from "@/lib/schema";
import { absoluteUrl, ogDefaults } from "@/lib/site";
import { appRouter } from "@/server/routers";

const description =
  "Complete executive leadership archive of NACOS, University of Uyo Chapter: elected faculty council officers, presidential aides, and the software development team across academic sessions.";

export const metadata: Metadata = {
  title: "The Executives · Faculty Leadership Archive",
  description,
  alternates: { canonical: "/executives" },
  openGraph: { ...ogDefaults, title: "The Executives · NACOS UNIUYO", description, url: "/executives" },
  twitter: { card: "summary_large_image", title: "The Executives · NACOS UNIUYO", description },
};

export default async function ExecutivesPage() {
  const caller = appRouter.createCaller({ session: null });
  const [sessions, allRoster] = await Promise.all([
    caller.session.list(),
    caller.roster.list(),
  ]);

  // Order sessions starting with current session first, then descending
  const orderedSessions = [...sessions].sort((a, b) => {
    if (a.isCurrent) return -1;
    if (b.isCurrent) return 1;
    return b.slug.localeCompare(a.slug);
  });

  const sessionsData = orderedSessions.map((session) => {
    const sessionMembers = allRoster.filter((p) => p.sessionSlug === session.slug);
    const excos = sessionMembers.filter((p) => p.tier === "elected_exco");
    const aides = sessionMembers.filter((p) => p.tier === "aide");
    const devTeam = sessionMembers.filter((p) => p.tier === "dev_team");

    return {
      session,
      excos,
      aides,
      devTeam,
    };
  }).filter((s) => s.excos.length > 0 || s.aides.length > 0 || s.devTeam.length > 0);

  const currentSessionExcos = sessionsData[0]?.excos ?? [];

  return (
    <>
      <section className="relative bg-[var(--forest)] text-white overflow-hidden min-h-[min(780px,calc(100svh-80px))] flex items-center py-[clamp(64px,8vw,100px)]" aria-labelledby="ex-title">
        <div className="grid-bg drift" aria-hidden="true" />
        <HeroOrbits label="{ LEADERSHIP }" className="hero-orbits fade" />
        <div className="wrap relative flex flex-col gap-6 w-full">
          <Breadcrumbs items={[{ name: "NACOS UNIUYO", path: "/" }, { name: "Executives" }]} />
          <span className="eyebrow on-dark caps fade d1">Faculty Leadership Archive</span>
          <h1 id="ex-title" className="serif m-0 text-[clamp(42.6px,6.6vw,91.8px)] leading-[0.95] tracking-[-0.02em]">
            <span className="line">
              <span className="rise d1">The Executive</span>
            </span>
            <span className="line">
              <span className="rise d2 gold">Leadership</span>
            </span>
          </h1>
          <p className="fade d3 m-0 max-w-[620px] text-[clamp(17px,1.7vw,19px)] leading-relaxed text-[var(--mint-2)]">
            Elected council officers, presidential aides, and the technical software directorate serving computing
            students across academic sessions.
          </p>
        </div>
      </section>

      <section className="bg-[var(--sand)] py-[var(--section-y)]" aria-label="Executive leadership by session">
        <div className="wrap">
          <ExecutivesInfiniteList initialSessionsData={sessionsData} />
        </div>
      </section>

      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "NACOS UNIUYO", path: "/" },
            { name: "Executives", path: "/executives" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Executive Leadership Archive, NACOS UNIUYO",
            itemListElement: currentSessionExcos.map((x, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "Person",
                name: x.fullName,
                jobTitle: x.roleTitle,
                image: x.photoUrl ? absoluteUrl(x.photoUrl) : undefined,
                url: absoluteUrl(`/executives#${x.slug}`),
                worksFor: { "@id": absoluteUrl("/#organization") },
              },
            })),
          },
        ]}
      />
    </>
  );
}
