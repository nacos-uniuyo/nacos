# NACOS UNIUYO Portal: Technical Architecture Specification (RFC)

## 1. System Architecture Overview

The system transitions the NACOS UNIUYO web platform from static file-backed data to an authenticated, database-backed administrative portal hosted on Vercel.

```
┌─────────────────────────────────────────────────────────────┐
│                 Client Browser (Public / User / Editor)     │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON-RPC
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Next.js 16 (App Router, React 19)           │
│                                                             │
│  Public Routes:            Portal & Admin Routes:          │
│   • / (Homepage)            • /dashboard (Member Hub)       │
│   • /departments/[slug]     • /dashboard/projects/submit    │
│   • /projects, /projects/*  • /admin/projects (Review)      │
│   • /opportunities          • /admin/departments           │
│   • /yearbook, /alumni      • /admin/events                 │
│   • /events, /events/[slug] • /admin/yearbook               │
│   • /blog, /blog/[slug]     • /admin/goodwill               │
│                             • /admin/users (Permissions)    │
│                                                             │
│  Type-Safe API Layer:                                       │
│   • tRPC v11 Router (Public, Protected, Editor, Admin)      │
│   • Mock Fixture Layer (Offline / Early Dev)                │
│                                                             │
│  Auth Layer:                                                │
│   • Better Auth (Google OAuth)                              │
│   • Session Verification & Multi-Tier Role Enforcement      │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │ Direct Upload Signatures
               ▼                              ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│    PostgreSQL (Neon Serverless│ │        Cloudinary          │
│    HTTP Driver)              │ │   Portraits, Project Media │
│   Managed via Drizzle ORM    │ │   and Event Flyers         │
└──────────────────────────────┘ └────────────────────────────┘
```


## 2. Technical Decisions & Core Directives

Based on our architectural decisions, the core principles of the implementation are:

1. **Neon Serverless Driver with Drizzle ORM (`@neondatabase/serverless`):**  
   We utilize `@neondatabase/serverless` alongside `drizzle-orm/neon-http`. In serverless execution contexts on Vercel, the HTTP driver eliminates connection pooling limits, connection leaks, and cold-start proxy latency. The runtime client lives in `db/index.ts`, the schema in `db/schema.ts`, the typed `jsonb` shapes in `db/json.ts`, and Drizzle Kit connects over the unpooled endpoint from `drizzle.config.ts`.
2. **Universal Google OAuth with User-Tiered RBAC:**  
   Authentication is open to any user with a Google account. On initial sign-up, the user receives the default role `user`. Access levels are partitioned into three explicit tiers:
   - `user`: Public member dashboard, personal profile management, project showcase proposals (`draft` -> `submitted`), opportunity submissions, and yearbook profile claiming.
   - `department_editor`: Scoped to an assigned department ID. Can manage departmental officer listings, staff directories, notices, and review student project proposals within their department.
   - `admin`: Global faculty leadership (President, Staff Adviser, Director of Software, Dev Team Lead). Full access to role assignments, Dean's welcome address platform configuration, goodwill message moderation, and global publishing.
3. **Uniuyo Registration Number Integration & Double-Batch Onboarding:**  
   Student accounts are enriched with their Uniuyo registration number (e.g. `22/SC/CO/1199`). This enables automated mapping to their entry department and academic session. The special double-admitted merged cohort (2022/2023 set, containing both `22` and `23` prefixes) is handled cleanly via session prefix metadata.
4. **Decoupled Identity (`person`) and Session Roles (`session_role`):**  
   People are modeled independently of temporal appointments. A single person can hold multiple roles in the same academic session (e.g. serving as an elected Exco and contributing to the Dev Team) or evolve across sessions (e.g. Aide -> Exco -> Graduating Alumnus) without data duplication.
5. **Living Staff Directory:**  
   `faculty_staff` records are permanent, active institutional records rather than ephemeral session-bound listings. The Head of Department (HOD) on `department` directly references their staff record.
6. **No Raw HTML in Storage (TipTap JSON AST):**  
   Rich-text content (announcements, project descriptions, staff bios, Dean's message) is stored as structured TipTap JSON in PostgreSQL `jsonb` columns, validated via Zod schemas and rendered safely with React components.
7. **tRPC Router with Mock Data Decoupling:**  
   All data consumption routes through a centralized tRPC router. Procedures are guarded by explicit middleware wrappers (`publicProcedure`, `protectedProcedure`, `departmentEditorProcedure`, `adminProcedure`). When database credentials are not supplied, procedures fall back to typed mock seed fixtures so frontend developers can build immediately without running a local database.
8. **Design System & Developer Ergonomics:**  
   The application leverages shadcn/ui components customized with core theme tokens. Developers have full compositional freedom to craft creative layouts for their assigned routes while adhering strictly to shared design tokens and primitives. Forms use React Hook Form integrated with Zod validation.
9. **Tooling & CI/CD Pipeline:**  
   The codebase runs on Next.js 16, TypeScript 7, and Bun. Code hygiene is enforced via Oxlint and Lefthook:
   - `pre-commit`: Typechecking via `bun x tsc --noEmit` and linting via `oxlint`.
   - `pre-push`: Full build verification via `bun run build`.
   - Deployment: Automated continuous deployment to Vercel via GitHub Actions running entirely on Bun (`oven-sh/setup-bun@v2`).
10. **Environment Variable Management (T3 Env):**  
    All runtime and client-side variables are strictly validated through `@t3-oss/env-nextjs`. Every variable is required without defaults, preventing hidden assumptions and runtime deployment crashes.


## 3. Database Schema (Drizzle ORM)

All tables use standard UUID primary keys and timestamp tracking. In accordance with project conventions, text-based enums are used instead of PostgreSQL native enums, and explicit relations are exported for all tables. Everything below lives in `db/schema.ts`, and the column snippets omit the import block for clarity. Shared enum tuples (`roleNames`, `roleTiers`, `projectCategories`, `opportunityTypes`, `opportunityStatuses`) live in `lib/enums.ts`, so the schema, the tRPC contracts and the UI all agree on one list. `jsonb` columns are typed by the concrete exports in `db/json.ts` (`RichTextDoc`, `SocialLinks`, `LeadContributor`, `AgendaItem`, `GuestAuthor`, `PlatformSettingValue`) rather than loose records, and every `updatedAt` carries `.$onUpdate(() => new Date()).defaultNow()`.

### 3.1 Better Auth Core Tables
Managed automatically by Better Auth's Drizzle adapter:
- `user` (`id`, `name`, `email`, `email_verified`, `image`, `role`, `department_id`, `reg_number`, `created_at`, `updated_at`)
- `session` (`id`, `user_id`, `token`, `expires_at`, `ip_address`, `user_agent`)
- `account` (`id`, `user_id`, `account_id`, `provider_id`, `access_token`, `refresh_token`, `expires_at`, `password`)
- `verification` (`id`, `identifier`, `value`, `expires_at`)

### 3.2 Academic Years & Sessions (`school_session`)
Named `school_session` to prevent collisions with Better Auth's HTTP auth `session` table:

```typescript
export const schoolSession = pgTable("school_session", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 32 }).notNull().unique(), // e.g. "2022-2023"
  name: varchar("name", { length: 64 }).notNull(), // e.g. "2022/2023 Academic Session"
  theme: text("theme"), // e.g. "The Pioneer Administration"
  regNumberPrefixes: jsonb("reg_number_prefixes").$type<string[]>().default([]), // e.g. ["22", "23"] for the double-admitted set
  isCurrent: boolean("is_current").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).defaultNow().notNull(),
});
```

### 3.3 Departments & Faculty Staff (`department` & `faculty_staff`)
Living, permanent faculty staff records and the five academic departments:

```typescript
export const facultyStaff = pgTable("faculty_staff", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  fullName: varchar("full_name", { length: 128 }).notNull(),
  designation: varchar("designation", { length: 128 }).notNull(), // e.g. "Staff Adviser", "Senior Lecturer"
  departmentId: uuid("department_id").references((): AnyPgColumn => department.id, { onDelete: "set null" }),
  email: varchar("email", { length: 255 }),
  photoUrl: text("photo_url"),
  photoPublicId: varchar("photo_public_id", { length: 255 }),
  bioJson: jsonb("bio_json").$type<RichTextDoc | null>(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).defaultNow().notNull(),
});

export const department = pgTable("department", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 64 }).notNull().unique(), // 'computer-science', 'cybersecurity', etc.
  name: varchar("name", { length: 128 }).notNull(),
  shortName: varchar("short_name", { length: 32 }).notNull(), // 'CSC', 'CYB', etc.
  hodStaffId: uuid("hod_staff_id").references(() => facultyStaff.id, { onDelete: "set null" }),
  descriptionJson: jsonb("description_json").$type<RichTextDoc | null>(),
  bannerUrl: text("banner_url"),
  bannerPublicId: varchar("banner_public_id", { length: 255 }),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).defaultNow().notNull(),
});
```

### 3.4 People & Session Roles (`person` & `session_role`)
Decouples human identity from session appointments (elected excos, aides, dev team, and graduating alumni):

```typescript
export const person = pgTable("person", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  fullName: varchar("full_name", { length: 128 }).notNull(),
  photoUrl: text("photo_url"),
  photoPublicId: varchar("photo_public_id", { length: 255 }),
  socials: jsonb("socials").$type<SocialLinks | null>(),
  currentRole: varchar("current_role", { length: 128 }),
  currentCompany: varchar("current_company", { length: 128 }),
  bioJson: jsonb("bio_json").$type<RichTextDoc | null>(),
  claimedByUserId: uuid("claimed_by_user_id").references(() => user.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).defaultNow().notNull(),
});

export const sessionRole = pgTable("session_role", {
  id: uuid("id").primaryKey().defaultRandom(),
  personId: uuid("person_id").notNull().references(() => person.id, { onDelete: "cascade" }),
  sessionId: uuid("session_id").notNull().references(() => schoolSession.id, { onDelete: "cascade" }),
  departmentId: uuid("department_id").references(() => department.id, { onDelete: "set null" }), // Null for faculty central
  tier: text("tier", { enum: roleTiers }).notNull(),
  roleTitle: varchar("role_title", { length: 128 }).notNull(), // e.g. "President", "Lead Backend", "Graduating Senior"
  honours: varchar("honours", { length: 255 }), // e.g. "First Class Honours"
  quote: text("quote"), // Yearbook quote
  sortOrder: integer("sort_order").notNull().default(0),
  isFeaturedHomepage: boolean("is_featured_homepage").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).defaultNow().notNull(),
});
```

### 3.5 Student & Faculty Project Showcase (`project`)
Supports coursework groups (Group 1 - 10) and individual teams with computing categories:

```typescript
export const project = pgTable("project", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  tagline: varchar("tagline", { length: 255 }).notNull(),
  descriptionJson: jsonb("description_json").$type<RichTextDoc>().notNull(),
  departmentId: uuid("department_id").notNull().references(() => department.id),
  sessionId: uuid("session_id").references(() => schoolSession.id),
  category: text("category", { enum: projectCategories }).notNull(),
  courseCode: varchar("course_code", { length: 32 }), // e.g. "CSC 411", "CYB 312"
  cohortGroupNumber: integer("cohort_group_number"), // e.g. 1 to 10 for class group assignments
  teamDisplayName: varchar("team_display_name", { length: 128 }), // e.g. "CSC 400L - Group 4"
  leadContributors: jsonb("lead_contributors").$type<LeadContributor[]>().notNull().default([]),
  status: text("status", {
    enum: ["draft", "submitted", "approved", "rejected"],
  }).notNull().default("draft"),
  rejectionReason: text("rejection_reason"),
  authorUserId: uuid("author_user_id").notNull().references(() => user.id),
  bannerUrl: text("banner_url"),
  bannerPublicId: varchar("banner_public_id", { length: 255 }),
  galleryUrls: jsonb("gallery_urls").$type<string[]>().default([]),
  repoUrl: text("repo_url"),
  demoUrl: text("demo_url"),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).defaultNow().notNull(),
});
```

### 3.6 Opportunities & SIWES / IT Directory (`opportunity`)
Curated listings for SIWES placements, scholarships, and partnerships with co-branding logos:

```typescript
export const opportunity = pgTable("opportunity", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  orgName: varchar("org_name", { length: 128 }).notNull(),
  orgUrl: text("org_url"),
  orgLogoUrl: text("org_logo_url"),
  scopeType: text("scope_type", {
    enum: ["faculty", "department", "session"],
  }).notNull().default("faculty"),
  departmentId: uuid("department_id").references(() => department.id, { onDelete: "set null" }),
  sessionId: uuid("session_id").references(() => schoolSession.id, { onDelete: "set null" }),
  type: text("type", { enum: opportunityTypes }).notNull(),
  location: varchar("location", { length: 128 }).notNull(),
  descriptionJson: jsonb("description_json").$type<RichTextDoc>().notNull(),
  applyUrl: text("apply_url").notNull(),
  deadline: timestamp("deadline", { withTimezone: true }),
  status: text("status", { enum: opportunityStatuses }).notNull().default("draft"),
  rejectionReason: text("rejection_reason"),
  submittedByUserId: uuid("submitted_by_user_id").notNull().references(() => user.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).defaultNow().notNull(),
});
```

### 3.7 Goodwill Messages & Platform Settings (`goodwill_message` & `platform_setting`)
Reuses existing people and staff records without duplicating image assets:

```typescript
export const goodwillMessage = pgTable("goodwill_message", {
  id: uuid("id").primaryKey().defaultRandom(),
  personId: uuid("person_id").references(() => person.id, { onDelete: "set null" }),
  staffId: uuid("staff_id").references(() => facultyStaff.id, { onDelete: "set null" }),
  guestAuthor: jsonb("guest_author").$type<GuestAuthor | null>(),
  messageJson: jsonb("message_json").$type<RichTextDoc>().notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).defaultNow().notNull(),
});

export const platformSetting = pgTable("platform_setting", {
  key: varchar("key", { length: 64 }).primaryKey(),
  valueJson: jsonb("value_json").$type<RichTextDoc>().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).defaultNow().notNull(),
});
```

### 3.8 Events, News & Redirects (`event`, `post`, `slug_redirect`)

```typescript
export const event = pgTable("event", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  tagline: varchar("tagline", { length: 255 }),
  descriptionJson: jsonb("description_json").$type<RichTextDoc>().notNull(),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  venueName: varchar("venue_name", { length: 255 }).notNull(),
  venueAddress: text("venue_address"),
  googleMapsUrl: text("google_maps_url"),
  flyerUrl: text("flyer_url"),
  flyerPublicId: varchar("flyer_public_id", { length: 255 }),
  agenda: jsonb("agenda").$type<AgendaItem[]>().notNull().default([]),
  published: boolean("published").notNull().default(false),
  authorUserId: uuid("author_user_id").notNull().references(() => user.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).defaultNow().notNull(),
});

export const post = pgTable("post", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  excerpt: text("excerpt").notNull(),
  bodyJson: jsonb("body_json").$type<RichTextDoc>().notNull(),
  status: text("status", {
    enum: ["draft", "scheduled", "published"],
  }).notNull().default("draft"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  featured: boolean("featured").notNull().default(false),
  authorUserId: uuid("author_user_id").notNull().references(() => user.id),
  coverUrl: text("cover_url"),
  coverPublicId: varchar("cover_public_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).defaultNow().notNull(),
});

export const slugRedirect = pgTable("slug_redirect", {
  id: uuid("id").primaryKey().defaultRandom(),
  entityType: text("entity_type", {
    enum: ["post", "event", "project", "person"],
  }).notNull(),
  oldSlug: varchar("old_slug", { length: 128 }).notNull().unique(),
  targetSlug: varchar("target_slug", { length: 128 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```


## 4. Environment Variables Configuration (T3 Env)

Environment configuration is strictly managed through `env.ts` using `@t3-oss/env-nextjs`:

```typescript
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    DATABASE_URL_UNPOOLED: z.string().url(),
    PGHOST: z.string().min(1),
    PGUSER: z.string().min(1),
    PGDATABASE: z.string().min(1),
    PGPASSWORD: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url(),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    CLOUDINARY_API_KEY: z.string().min(1),
    CLOUDINARY_API_SECRET: z.string().min(1),
    CLOUDINARY_CLOUD_NAME: z.string().min(1),
    APP_URL: z.string().url(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().min(1),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED,
    PGHOST: process.env.PGHOST,
    PGUSER: process.env.PGUSER,
    PGDATABASE: process.env.PGDATABASE,
    PGPASSWORD: process.env.PGPASSWORD,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    APP_URL: process.env.APP_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  },
});
```


## 5. Phased Implementation Roadmap

### Phase 1: Handover Foundation & Tooling (Internal Scaffolding)
- Upgrade and verify project configuration: Next.js 16, TypeScript 7, and Bun runtime.
- Setup Lefthook git hooks: pre-commit (Typecheck + Oxlint) and pre-push (Build).
- Setup T3 Env with required environment definitions.
- Initialize shadcn/ui theme configuration and core primitives.
- Scaffold tRPC router contracts with mock seed repositories for offline developer ergonomics.
- Configure pure Bun GitHub Actions workflow for Vercel production deployment.

### Phase 2: Public Portals & Department Hubs (Dev Team Stream)
- Department hubs (`/departments/[slug]`) for Computer Science, Cybersecurity, Information Systems, Data Analytics, and Software Engineering.
- Student & faculty project showcase gallery (`/projects`) with embedded systems and cyber security category tagging.
- Opportunities and SIWES/IT discovery portal (`/opportunities`).
- Permanent alumni archives and graduating class yearbooks (`/yearbook`, `/alumni`).
- Homepage leadership welcome section (Dean's address) and goodwill messages carousel.
- Full University of Uyo (UNIUYO) co-branding in headers, footers, and metadata previews.

### Phase 3: Database & Cloud Infrastructure Integration
- Drizzle ORM Neon HTTP setup, schema definitions, and migration generation (`bun run db:generate`, then `bun run db:migrate` against the unpooled URL).
- Better Auth setup with Google OAuth and session management.
- Switch tRPC procedures from mock repositories to live Drizzle queries.
- Cloudinary client-side upload signatures and image optimization pipeline.

### Phase 4: Portals, Dashboards & Moderation Workflows
- Member dashboard for authenticated users (profile management, project submission proposals).
- Department coordinator management consoles (department roster updates, project review queue).
- Faculty administrator control center (platform configuration for Dean's welcome address, goodwill moderation, allowlist permissions).

### Phase 5: Student Community & Interaction Space
- Contextual discussions and feedback channels on student projects and opportunities.
- General student discussion forums and resource sharing boards.
