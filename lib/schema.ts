import { executives } from "./executives";
import { venueLine, type NacosEvent } from "./events";
import { absoluteUrl, site } from "./site";

const orgId = absoluteUrl("/#organization");

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": orgId,
    name: site.name,
    legalName: site.legalName,
    alternateName: ["NACOS University of Uyo", "Nigeria Association of Computing Students UNIUYO"],
    url: absoluteUrl("/"),
    logo: absoluteUrl("/images/nacos-logo.png"),
    description: site.shortDescription,
    slogan: site.tagline,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    parentOrganization: {
      "@type": "Organization",
      name: "Nigeria Association of Computing Students",
      url: site.social.national,
    },
    sameAs: [site.social.x],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: absoluteUrl("/"),
    publisher: { "@id": orgId },
    inLanguage: "en-NG",
  };
}

export function eventSchema(e: NacosEvent) {
  const url = absoluteUrl(`/events/${e.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `${e.title}, NACOS UNIUYO`,
    description: `${e.summary} ${e.description}`,
    startDate: e.start,
    endDate: e.end,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    isAccessibleForFree: true,
    url,
    image: [absoluteUrl(e.flyer.src)],
    location: {
      "@type": "Place",
      name: `${e.venue.name}, ${e.venue.institution} ${e.venue.area}`,
      geo: { "@type": "GeoCoordinates", latitude: e.venue.geo.lat, longitude: e.venue.geo.lng },
      hasMap: e.venue.mapLink,
      address: {
        "@type": "PostalAddress",
        streetAddress: venueLine(e),
        addressLocality: e.venue.locality,
        addressRegion: e.venue.region,
        addressCountry: e.venue.country,
      },
    },
    organizer: { "@type": "Organization", "@id": orgId, name: site.name, url: absoluteUrl("/") },
    performer: executives.map((x) => ({
      "@type": "Person",
      name: x.name,
      jobTitle: x.role,
      image: x.photo ? absoluteUrl(x.photo) : undefined,
    })),
    offers: {
      "@type": "Offer",
      price: 0,
      priceCurrency: "NGN",
      availability: "https://schema.org/InStock",
      url,
    },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export function projectSchema({
  title,
  tagline,
  slug,
  category,
  courseCode,
  teamDisplayName,
  repoUrl,
  demoUrl,
  departmentName,
}: {
  title: string;
  tagline: string;
  slug: string;
  category: string;
  courseCode?: string | null;
  teamDisplayName?: string | null;
  repoUrl?: string | null;
  demoUrl?: string | null;
  departmentName?: string | null;
}) {
  const url = absoluteUrl(`/projects/${slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: title,
    name: title,
    description: tagline,
    url,
    inLanguage: "en-NG",
    about: departmentName ? `Department of ${departmentName}` : "Faculty of Computing",
    articleSection: category,
    keywords: [category, courseCode, departmentName, "NACOS UNIUYO", "Student Engineering"].filter(Boolean).join(", "),
    author: {
      "@type": "Organization",
      name: teamDisplayName ?? "NACOS Project Team",
    },
    publisher: {
      "@type": "Organization",
      "@id": orgId,
      name: site.name,
      url: absoluteUrl("/"),
    },
    ...(repoUrl ? { codeRepository: repoUrl } : {}),
    ...(demoUrl ? { sameAs: [demoUrl] } : {}),
  };
}

export function projectCollectionSchema(projects: { title: string; slug: string; tagline: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Student and Faculty Project Showcase",
    description:
      "Searchable gallery of student innovations, coursework group projects, embedded systems, cybersecurity tools, and academic research across the Faculty of Computing, University of Uyo.",
    url: absoluteUrl("/projects"),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: projects.map((p, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: p.title,
        description: p.tagline,
        url: absoluteUrl(`/projects/${p.slug}`),
      })),
    },
  };
}

export function opportunitySchema(opp: {
  title: string;
  slug: string;
  orgName: string;
  location: string;
  type: string;
  deadline?: string | null;
  applyUrl?: string | null;
  departmentSlug?: string | null;
}) {
  const url = absoluteUrl(`/opportunities/${opp.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": opp.type === "job" ? "JobPosting" : "EducationalOccupationalProgram",
    name: opp.title,
    headline: opp.title,
    description: `${opp.title} offered by ${opp.orgName} in ${opp.location}.`,
    url,
    inLanguage: "en-NG",
    hiringOrganization: {
      "@type": "Organization",
      name: opp.orgName,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: opp.location,
        addressCountry: "NG",
      },
    },
    ...(opp.deadline ? { validThrough: opp.deadline } : {}),
    ...(opp.applyUrl ? { applicationContact: { "@type": "ContactPoint", url: opp.applyUrl } } : {}),
    provider: {
      "@type": "Organization",
      "@id": orgId,
      name: site.name,
      url: absoluteUrl("/"),
    },
  };
}

export function opportunityCollectionSchema(
  items: { title: string; slug: string; orgName: string; location: string; applyUrl: string | null }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Opportunities and Career Hub",
    description:
      "Curated directory of student internships, SIWES placements, scholarships, research grants, and graduate trainee positions across the Faculty of Computing, University of Uyo.",
    url: absoluteUrl("/opportunities"),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items.map((opp, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: opp.title,
        description: `${opp.orgName} - ${opp.location}`,
        url: opp.applyUrl || absoluteUrl(`/opportunities/${opp.slug}`),
      })),
    },
  };
}

export function personSchema(p: {
  fullName: string;
  slug: string;
  roleTitle: string;
  photoUrl?: string | null;
  departmentName?: string | null;
  sessionName?: string | null;
  currentRole?: string | null;
  currentCompany?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  portfolioUrl?: string | null;
  basePath?: string;
  isAlumni?: boolean;
}) {
  const basePath = p.basePath ?? "/yearbook";
  const url = absoluteUrl(`${basePath}/${p.slug}`);
  const sameAs = [p.linkedinUrl, p.githubUrl, p.portfolioUrl].filter(
    (u): u is string => Boolean(u),
  );

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: p.fullName,
    url,
    jobTitle: p.currentRole ?? p.roleTitle,
    ...(p.photoUrl ? { image: absoluteUrl(p.photoUrl) } : {}),
    ...(p.currentCompany
      ? {
          worksFor: {
            "@type": "Organization",
            name: p.currentCompany,
          },
        }
      : {}),
    ...(p.isAlumni !== false
      ? {
          alumniOf: {
            "@type": "EducationalOrganization",
            name: "University of Uyo",
            department: p.departmentName ? `Department of ${p.departmentName}` : "Faculty of Computing",
          },
        }
      : {
          worksFor: {
            "@type": "EducationalOrganization",
            name: "University of Uyo",
            department: p.departmentName ? `Department of ${p.departmentName}` : "Faculty of Computing",
          },
        }),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function yearbookCollectionSchema(
  items: { fullName: string; slug: string; roleTitle: string; departmentName?: string | null }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Faculty of Computing Alumni Archive and Digital Yearbook",
    description:
      "Permanent living yearbook and alumni directory honoring graduating cohorts and student innovators across the Faculty of Computing, University of Uyo.",
    url: absoluteUrl("/yearbook"),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items.map((p, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: p.fullName,
        description: `${p.roleTitle}${p.departmentName ? ` · Department of ${p.departmentName}` : ""}`,
        url: absoluteUrl(`/yearbook/${p.slug}`),
      })),
    },
  };
}
