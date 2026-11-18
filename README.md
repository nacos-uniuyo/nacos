# NACOS UNIUYO website

Website of the Nigeria Association of Computing Students, University of Uyo Chapter. Built with Next.js 16 (App Router), React 19, TypeScript and Bun. The public pages are statically generated from data in `lib/`; the portal described in [docs/prd.md](docs/prd.md) and [docs/rfc-cms-architecture.md](docs/rfc-cms-architecture.md) is being added in phases.

## Run it

```bash
bun install
cp .env.example .env   # then replace the placeholder values
bun run dev            # http://localhost:3000
bun run build          # production build
bun run typecheck
bun run lint
```

Everything in `env.ts` is required and validated at startup, so the dev server refuses to boot until `.env` holds every variable. That is deliberate: a missing credential should fail on your machine, not in production.

Lefthook runs typecheck and lint before each commit and a full build before each push. `bunx lefthook install` wires the hooks into `.git/hooks`.

## Pages

| Route | What it is |
| --- | --- |
| `/` | Homepage |
| `/executives` | The 4th Executive Council |
| `/events` | All events |
| `/events/[slug]` | Event page with countdown, council, highlights and venue |
| `/events/[slug]/programme` | Full order of events |
| `/events/[slug]/calendar.ics` | Calendar file download |
| `/api/trpc/[trpc]` | tRPC HTTP endpoint (portal data) |

## Editing content

Public content lives in plain TypeScript files under `lib/`:

- `lib/events.ts`: events, dates, venue and programme. Add a new object to `events` to publish another event page.
- `lib/executives.ts`: council names and offices.
- `lib/site.ts`: name, description and social links.

Executive portraits live in `public/images/execs/<slug>.webp`, cropped to 4:5 (at most 960x1200). To swap one, export a new 4:5 WebP under the same name. An officer without a `photo` falls back to an initials card.

## Portal scaffold

`server/` is the type-safe data layer for the portal. `server/contracts.ts` holds the Zod schemas every page receives, `server/mock.ts` holds seed fixtures, and `server/routers.ts` exposes them through tRPC procedures. Routers validate mock output against the contracts, so a fixture that drifts from its schema fails at the boundary instead of rendering something wrong. Public pages can be built against these procedures today; Phase 3 replaces the procedure bodies with Drizzle queries and leaves the signatures alone.

Client components reach the API through `lib/trpc/client.tsx`, which is mounted with TanStack Query in `app/providers.tsx`.

`components/ui/` holds the shadcn/ui primitives. Tailwind utilities are imported in `app/globals.css` without preflight, because the existing stylesheet already carries the project reset. Theme tokens map the shadcn variables onto the NACOS palette.

## Database

[db/schema.ts](db/schema.ts) defines every table on Neon: the Better Auth core tables, sessions and roles, departments and staff, projects, opportunities, goodwill, events, posts and slug redirects. Rich content is `jsonb` typed by the zod shapes in [db/json.ts](db/json.ts), so a query knows whether it is holding a TipTap document or a social links object. The enum tuples shared by the schema, the tRPC contracts and the UI live in [lib/enums.ts](lib/enums.ts), so adding a category or a role is one edit. [db/index.ts](db/index.ts) exports `db`, a Drizzle client over Neon's HTTP driver with the pooled connection string, which is what Vercel should use. Drizzle Kit connects over the unpooled string, because DDL through PgBouncer is unreliable.

```bash
bun run db:generate   # write SQL migrations into drizzle/ from the schema
bun run db:migrate    # apply pending migrations
bun run db:check      # verify migration consistency
bun run db:push       # prototype only, skips migration files
bun run db:studio     # browse the database
```

The migrations in `drizzle/` are generated and applied to the Neon database, so all 16 tables exist. The tRPC routers still read the mock fixtures; switching them to live Drizzle queries is the remaining Phase 3 step.

## SEO

- Per-page titles, descriptions, canonical URLs, Open Graph and Twitter cards
- Generated share image for the brand (`app/opengraph-image.tsx`); event pages use the official flyer
- JSON-LD: `Organization`, `WebSite`, `Event`, `BreadcrumbList` and an `ItemList` of officers
- `sitemap.xml` (with image entries), `robots.txt` and a web manifest
