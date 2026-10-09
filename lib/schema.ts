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
      address: {
        "@type": "PostalAddress",
        streetAddress: venueLine(e),
        addressLocality: e.venue.locality,
        addressRegion: e.venue.region,
        addressCountry: e.venue.country,
      },
    },
    organizer: { "@type": "Organization", "@id": orgId, name: site.name, url: absoluteUrl("/") },
    performer: executives.map((x) => ({ "@type": "Person", name: x.name, jobTitle: x.role })),
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
