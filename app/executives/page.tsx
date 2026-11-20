import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/EventParts";
import { ExecCard } from "@/components/ExecCard";
import { ArrowRight } from "@/components/icons";
import { JsonLd } from "@/components/JsonLd";
import { HeroOrbits } from "@/components/Orbits";
import { featuredEvent } from "@/lib/events";
import { executives } from "@/lib/executives";
import { breadcrumbSchema } from "@/lib/schema";
import { absoluteUrl, ogDefaults } from "@/lib/site";

const description =
  "Meet the 4th Executive Council of NACOS, University of Uyo Chapter: President Banny Confidence Jack and eleven officers serving computing students this session.";

export const metadata: Metadata = {
  title: "The Executives, 4th Executive Council",
  description,
  alternates: { canonical: "/executives" },
  openGraph: { ...ogDefaults, title: "The Executives | NACOS UNIUYO", description, url: "/executives" },
  twitter: { card: "summary_large_image", title: "The Executives | NACOS UNIUYO", description },
};

export default function ExecutivesPage() {
  return (
    <>
      <section className="page-hero" aria-labelledby="ex-title">
        <div className="grid-bg drift" aria-hidden="true" />
        <HeroOrbits label="{ 4TH EXCO }" className="hero-orbits fade" />
        <div className="wrap">
          <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Executives" }]} />
          <span className="eyebrow on-dark caps fade d1">Leadership · The Revolution</span>
          <h1 id="ex-title" className="serif">
            <span className="line">
              <span className="rise d1">The 4th Executive</span>
            </span>
            <span className="line">
              <span className="rise d2 it gold">Council</span>
            </span>
          </h1>
          <p className="fade d3">
            Twelve officers, each with a portfolio, all answerable to the students who elected them. Every promise
            they make goes on Open-Track.
          </p>
        </div>
      </section>

      <section className="execs" aria-label="Council members">
        <div className="wrap">
          <ul className="exec-grid">
            {executives.map((x, i) => (
              <li key={x.slug} className="reveal">
                <ExecCard exec={x} index={i} priority={i < 4} />
              </li>
            ))}
          </ul>
          <Link className="text-link" href={`/events/${featuredEvent.slug}`}>
            Inauguration of the council: programme and venue
            <ArrowRight />
          </Link>
        </div>
      </section>

      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Executives", path: "/executives" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "4th Executive Council, NACOS UNIUYO",
            itemListElement: executives.map((x, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "Person",
                name: x.name,
                jobTitle: x.role,
                image: x.photo ? absoluteUrl(x.photo) : undefined,
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
