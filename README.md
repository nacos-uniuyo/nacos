# NACOS UNIUYO website

Website of the Nigeria Association of Computing Students, University of Uyo Chapter. Built with Next.js (App Router). Every page is statically generated, and there is no database yet.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

Set `NEXT_PUBLIC_SITE_URL` (see `.env.example`) to the live domain. On Vercel it falls back to the production URL automatically. It feeds canonical links, the sitemap, `robots.txt` and the social share cards.

## Pages

| Route | What it is |
| --- | --- |
| `/` | Homepage |
| `/executives` | The 4th Executive Council |
| `/events` | All events |
| `/events/[slug]` | Event page with countdown, council, highlights and venue |
| `/events/[slug]/programme` | Full order of events |
| `/events/[slug]/calendar.ics` | Calendar file download |

## Editing content

All content lives in plain TypeScript files under `lib/`:

- `lib/events.ts`: events, dates, venue and programme. Add a new object to `events` to publish another event page.
- `lib/executives.ts`: council names and offices.
- `lib/site.ts`: name, description and social links.

Executive portraits live in `public/images/execs/<slug>.webp`, cropped to 4:5 (at most 960x1200). To swap one, export a new 4:5 WebP under the same name. An officer without a `photo` falls back to an initials card.

## SEO

- Per-page titles, descriptions, canonical URLs, Open Graph and Twitter cards
- Generated share image for the brand (`app/opengraph-image.tsx`); event pages use the official flyer
- JSON-LD: `Organization`, `WebSite`, `Event`, `BreadcrumbList` and an `ItemList` of officers
- `sitemap.xml` (with image entries), `robots.txt` and a web manifest
