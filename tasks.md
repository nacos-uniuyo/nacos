# PR 10 Decomposition and Staging Plan

This document defines the execution plan for breaking down the monolithic Phase 2 PR (#10, branch `feat/phase2-public-portals`) into smaller, modular pull requests that merge into `pr-10-staging` before final integration into `main`.

Every sub-PR must target `pr-10-staging`, compile cleanly with zero TypeScript errors via `bun run typecheck`, and feature a pull request description composed in well-structured paragraphs without bullet points or em dashes.

## Staging Architecture

- Staging branch: `pr-10-staging` (branched off `origin/main`).
- Target for decomposed PRs: `pr-10-staging`.
- Final release: A single validated PR from `pr-10-staging` into `main` after all slices are integrated and reviewed.

## Decomposition Slices

### Slice 1: Co-Branded Shell and Layout Foundations
- Branch: `feat/p2-shell-and-foundations`
- Scope:
  - Institutional metadata and URLs in `lib/site.ts`.
  - University vector insignia (`UniuyoCrest`) and social/brand icons in `components/icons.tsx`.
  - Co-branded responsive header in `components/Header.tsx`.
  - Co-branded footer and layout metadata in `components/Footer.tsx` and `app/layout.tsx`.
  - Safe TipTap AST rich text renderer in `components/RichTextRenderer.tsx`.
  - Shared CSS layout and typography variables in `app/globals.css`.
- Verification: Clean typecheck, correct header rendering, and navigation drawer responsiveness across screen sizes.

### Slice 2: Departmental Hubs
- Branch: `feat/p2-department-hubs`
- Scope:
  - Department index overview page at `app/departments/page.tsx`.
  - Dynamic individual department hub at `app/departments/[slug]/page.tsx`.
  - Department tabs component (`components/DepartmentHubTabs.tsx`) supporting HOD highlights, executive officers, staff directory, projects, alumni, and notices.
  - Department switcher bar and matching styles in `app/globals.css`.
- Verification: Static route generation (`generateStaticParams`) for all 5 departments, typecheck passing.

### Slice 3: Student and Faculty Project Showcase
- Branch: `feat/p2-project-showcase`
- Scope:
  - Project directory page at `app/projects/page.tsx`.
  - Dynamic project detail view at `app/projects/[slug]/page.tsx`.
  - Filterable, searchable gallery in `components/ProjectsGallery.tsx`.
  - Course code, department filter, and attribution layouts in `app/globals.css`.
- Verification: Clean typecheck, responsive gallery grid, and static parameter resolution.

### Slice 4: Opportunities and Career Hub
- Branch: `feat/p2-opportunities-hub`
- Scope:
  - Opportunities listing page at `app/opportunities/page.tsx`.
  - Multi-category feed in `components/OpportunitiesFeed.tsx` supporting SIWES, scholarships, internships, partnerships, and departmental scope filtering.
  - Opportunity card styles in `app/globals.css`.
- Verification: Clean typecheck, category and scope filter functionality.

### Slice 5: Living Digital Yearbook and Alumni Archive
- Branch: `feat/p2-alumni-yearbook`
- Scope:
  - Cohort yearbook page at `app/yearbook/page.tsx`.
  - Searchable alumni directory at `app/alumni/page.tsx`.
  - Detailed alumni profile view at `app/alumni/[slug]/page.tsx`.
  - Yearbook and alumni roster components in `components/YearbookView.tsx`.
  - Event calendar download route at `app/events/[slug]/calendar.ics/route.ts` and event detail refinements.
  - Associated styles in `app/globals.css`.
- Verification: Clean typecheck, iCalendar file export generation, and canonical profile route resolution.

### Slice 6: Homepage Enhancements and Integration
- Branch: `feat/p2-homepage-integration`
- Scope:
  - Homepage composition in `app/page.tsx` integrating Dean's card, department bento preview, featured projects, goodwill carousel, and upcoming events.
  - Goodwill carousel component in `components/GoodwillCarousel.tsx`.
  - Final stylistic harmonization in `app/globals.css`.
- Verification: Homepage loads without client hydration errors, all sub-sections link cleanly to their respective hub pages, full build verification.
