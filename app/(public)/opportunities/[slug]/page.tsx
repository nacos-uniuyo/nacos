import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/EventParts";
import { notFound } from "next/navigation";
import {
  Briefcase,
  Building2,
  Calendar,
  GraduationCap,
  Handshake,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "@/components/icons";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { RichTextRenderer } from "@/components/RichTextRenderer";
import type { OpportunityType } from "@/lib/enums";
import { breadcrumbSchema, opportunitySchema } from "@/lib/schema";
import { ogDefaults } from "@/lib/site";
import { appRouter } from "@/server/routers";
import { OPPORTUNITY_ARTICLES } from "./opportunity-articles";

const OPPORTUNITY_TYPE_LABELS: Record<OpportunityType, string> = {
  siwes_it: "SIWES/IT",
  scholarship: "Scholarship",
  sponsorship: "Sponsorship",
  partnership: "Partnership",
  job: "Job",
};

const TYPE_ICONS: Record<OpportunityType, React.ElementType> = {
  siwes_it: Briefcase,
  scholarship: GraduationCap,
  sponsorship: Sparkles,
  partnership: Handshake,
  job: Briefcase,
};

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const caller = appRouter.createCaller({ session: null });
  const opportunities = await caller.opportunity.list();
  return opportunities.map((opp) => ({ slug: opp.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const caller = appRouter.createCaller({ session: null });
  const [opportunity, departments] = await Promise.all([
    caller.opportunity.bySlug({ slug }),
    caller.department.list(),
  ]);

  if (!opportunity) {
    return { title: "Opportunity Not Found" };
  }

  const dept = departments.find((d) => d.slug === opportunity.departmentSlug);
  const typeLabel = OPPORTUNITY_TYPE_LABELS[opportunity.type] ?? opportunity.type;
  const title = `${opportunity.title} · ${typeLabel}`;
  const description = `${opportunity.title} offered by ${opportunity.orgName} for computing students and graduates of the University of Uyo.`;
  const deptName = dept ? dept.name : "Faculty of Computing";

  return {
    title,
    description,
    keywords: [
      opportunity.title,
      opportunity.orgName,
      typeLabel,
      deptName,
      "NACOS UNIUYO",
      "University of Uyo",
      "Faculty of Computing",
      "Student Opportunities",
    ],
    alternates: { canonical: `/opportunities/${opportunity.slug}` },
    openGraph: {
      ...ogDefaults,
      url: `/opportunities/${opportunity.slug}`,
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

export default async function OpportunityDetailPage({ params }: Props) {
  const { slug } = await params;
  const caller = appRouter.createCaller({ session: null });

  const [opportunity, departments] = await Promise.all([
    caller.opportunity.bySlug({ slug }),
    caller.department.list(),
  ]);

  if (!opportunity) {
    notFound();
  }

  const dept = departments.find((d) => d.slug === opportunity.departmentSlug) ?? null;
  const typeLabel = OPPORTUNITY_TYPE_LABELS[opportunity.type] ?? opportunity.type;
  const Icon = TYPE_ICONS[opportunity.type] ?? Briefcase;

  const articleDoc =
    OPPORTUNITY_ARTICLES[opportunity.slug] ??
    `Detailed information and submission guidelines for ${opportunity.title}.\n\nProvided by ${
      opportunity.orgName
    } in collaboration with the Faculty of Computing, University of Uyo.\n\nFor questions, reach out through departmental faculty advisors or the NACOS secretariat.`;

  function formatDeadline(deadlineString: string | null): string {
    if (!deadlineString) return "Rolling admissions / Open";
    try {
      const date = new Date(deadlineString);
      return date.toLocaleDateString("en-NG", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Active";
    }
  }

  const isExternalApply =
    Boolean(opportunity.applyUrl) &&
    (opportunity.applyUrl!.startsWith("http://") || opportunity.applyUrl!.startsWith("https://"));

  return (
    <>
      <PageHero id="opportunity-detail-title" orbitLabel={`{ ${typeLabel.toUpperCase()} }`}>
          <Breadcrumbs
            items={[
              { name: "NACOS UNIUYO", path: "/" },
              { name: "Opportunities", path: "/opportunities" },
              { name: opportunity.title },
            ]}
          />

          <div className="flex flex-wrap items-center gap-2.5 text-xs text-[var(--mint-2)]">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] text-[var(--mint-2)] font-semibold">
              <Icon size={13} className="text-[var(--gold)]" />
              <span>{typeLabel}</span>
            </span>

            {dept ? (
              <>
                <span className="opacity-40" aria-hidden="true">·</span>
                <Link
                  href={`/departments/${dept.slug}`}
                  className="caps no-underline text-[var(--gold)] hover:text-white font-medium transition-colors"
                >
                  Department of {dept.name}
                </Link>
              </>
            ) : (
              <>
                <span className="opacity-40" aria-hidden="true">·</span>
                <span className="caps text-[var(--gold)]">
                  Faculty-Wide Opportunity
                </span>
              </>
            )}
          </div>

          <h1
            id="opportunity-detail-title"
            className="serif text-white max-w-[62%] max-lg:max-w-none text-[clamp(36.1px,4.9vw,75.4px)] leading-[0.98]"
          >
            {opportunity.title}
          </h1>

          <p className="max-w-[580px] text-[var(--mint-2)] font-medium text-[clamp(16px,1.6vw,19px)] leading-relaxed">
            Offered by {opportunity.orgName} for computing students and researchers at the University of Uyo.
          </p>
      </PageHero>

      <section className="py-[var(--section-y)]" aria-label="Opportunity Details and Guidelines">
        <div className="wrap">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12 sm:gap-16 items-start">
            <article className="prose-clean min-w-0">
              <RichTextRenderer doc={articleDoc} />
            </article>

            <aside className="sticky top-28 flex flex-col gap-6 p-6 sm:p-8 bg-[var(--sand)] rounded-xl border border-[var(--rule)] shadow-sm">
              <h2 className="serif text-xl text-[var(--ink)] m-0">Opportunity Summary</h2>

              <dl className="flex flex-col gap-4 text-xs sm:text-sm m-0">
                <div className="flex flex-col gap-1 pb-3 border-b border-[rgba(15,26,19,0.08)]">
                  <dt className="text-[var(--muted)] font-medium flex items-center gap-1.5">
                    <Building2 size={14} className="text-primary" />
                    <span>Host Organization</span>
                  </dt>
                  <dd className="font-semibold text-[var(--ink)] m-0">{opportunity.orgName}</dd>
                </div>

                <div className="flex flex-col gap-1 pb-3 border-b border-[rgba(15,26,19,0.08)]">
                  <dt className="text-[var(--muted)] font-medium flex items-center gap-1.5">
                    <MapPin size={14} className="text-primary" />
                    <span>Location</span>
                  </dt>
                  <dd className="font-semibold text-[var(--ink)] m-0">{opportunity.location}</dd>
                </div>

                <div className="flex flex-col gap-1 pb-3 border-b border-[rgba(15,26,19,0.08)]">
                  <dt className="text-[var(--muted)] font-medium flex items-center gap-1.5">
                    <Calendar size={14} className="text-primary" />
                    <span>Application Deadline</span>
                  </dt>
                  <dd className="font-semibold text-[var(--ink)] m-0">
                    {formatDeadline(opportunity.deadline)}
                  </dd>
                </div>

                <div className="flex flex-col gap-1">
                  <dt className="text-[var(--muted)] font-medium flex items-center gap-1.5">
                    <GraduationCap size={14} className="text-primary" />
                    <span>Eligibility Scope</span>
                  </dt>
                  <dd className="font-semibold text-[var(--ink)] m-0">
                    {dept ? `Department of ${dept.name}` : "Faculty of Computing (All Departments)"}
                  </dd>
                </div>
              </dl>

              <div className="pt-2">
                {opportunity.applyUrl ? (
                  <Button asChild variant="solid" className="w-full">
                    <a
                      href={opportunity.applyUrl}
                      target={isExternalApply ? "_blank" : undefined}
                      rel={isExternalApply ? "noopener noreferrer" : undefined}
                    >
                      <span>{isExternalApply ? "Apply on Official Site" : "Submit Application"}</span>
                      <ArrowUpRight size={15} />
                    </a>
                  </Button>
                ) : (
                  <div className="p-4 rounded-xl bg-[var(--paper)] border border-[var(--rule)] text-xs text-[var(--ink)] leading-relaxed">
                    Applications for this faculty opportunity are submitted directly through the administrative instructions described on this page.
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "NACOS UNIUYO", path: "/" },
            { name: "Opportunities", path: "/opportunities" },
            { name: opportunity.title, path: `/opportunities/${opportunity.slug}` },
          ]),
          opportunitySchema(opportunity),
        ]}
      />
    </>
  );
}
