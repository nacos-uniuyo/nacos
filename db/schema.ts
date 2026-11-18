import { relations } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import {
  opportunityStatuses,
  opportunityTypes,
  projectCategories,
  roleNames,
  roleTiers,
} from "@/lib/enums";
import type {
  AgendaItem,
  GuestAuthor,
  LeadContributor,
  PlatformSettingValue,
  RichTextDoc,
  SocialLinks,
} from "./json";

/**
 * The NACOS UNIUYO schema. Read this together with docs/rfc-cms-architecture.md.
 *
 * Conventions: uuid primary keys, snake_case columns with camelCase properties,
 * text enums instead of Postgres native enums, typed jsonb for rich content, and
 * an exported relations object for every table.
 *
 * Both the pooled and unpooled Neon URLs point at the same database. The app
 * uses the pooled one through the HTTP driver; drizzle-kit uses the unpooled one.
 */

/* -------------------------------------------------------------------------- */
/* Faculty staff and departments                                              */
/* -------------------------------------------------------------------------- */

export const facultyStaff = pgTable("faculty_staff", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  fullName: varchar("full_name", { length: 128 }).notNull(),
  designation: varchar("designation", { length: 128 }).notNull(),
  departmentId: uuid("department_id").references((): AnyPgColumn => department.id, { onDelete: "set null" }),
  email: varchar("email", { length: 255 }),
  photoUrl: text("photo_url"),
  photoPublicId: varchar("photo_public_id", { length: 255 }),
  bioJson: jsonb("bio_json").$type<RichTextDoc | null>(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .defaultNow()
    .notNull(),
});

export const department = pgTable("department", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  shortName: varchar("short_name", { length: 32 }).notNull(),
  hodStaffId: uuid("hod_staff_id").references((): AnyPgColumn => facultyStaff.id, { onDelete: "set null" }),
  descriptionJson: jsonb("description_json").$type<RichTextDoc | null>(),
  bannerUrl: text("banner_url"),
  bannerPublicId: varchar("banner_public_id", { length: 255 }),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .defaultNow()
    .notNull(),
});

/* -------------------------------------------------------------------------- */
/* Better Auth core tables                                                    */
/* -------------------------------------------------------------------------- */

export const user = pgTable(
  "user",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 128 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    role: text("role", { enum: roleNames })
      .notNull()
      .default("user"),
    departmentId: uuid("department_id").references(() => department.id, { onDelete: "set null" }),
    regNumber: varchar("reg_number", { length: 32 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .defaultNow()
      .notNull(),
  },
  (table) => [index("user_department_id_idx").on(table.departmentId)],
);

export const session = pgTable(
  "session",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .defaultNow()
      .notNull(),
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .defaultNow()
      .notNull(),
  },
  (table) => [index("account_user_id_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .defaultNow()
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

/* -------------------------------------------------------------------------- */
/* People and session roles                                                   */
/* -------------------------------------------------------------------------- */

export const schoolSession = pgTable("school_session", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 32 }).notNull().unique(),
  name: varchar("name", { length: 64 }).notNull(),
  theme: text("theme"),
  /** e.g. ["22", "23"] for the one cohort admitted across the 2022/2023 transition. */
  regNumberPrefixes: jsonb("reg_number_prefixes").$type<string[]>().notNull().default([]),
  isCurrent: boolean("is_current").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .defaultNow()
    .notNull(),
});

export const person = pgTable(
  "person",
  {
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
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .defaultNow()
      .notNull(),
  },
  (table) => [unique("person_claimed_by_user_id_unique").on(table.claimedByUserId)],
);

export const sessionRole = pgTable(
  "session_role",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    personId: uuid("person_id")
      .notNull()
      .references(() => person.id, { onDelete: "cascade" }),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => schoolSession.id, { onDelete: "cascade" }),
    departmentId: uuid("department_id").references(() => department.id, { onDelete: "set null" }),
    tier: text("tier", { enum: roleTiers }).notNull(),
    roleTitle: varchar("role_title", { length: 128 }).notNull(),
    honours: varchar("honours", { length: 255 }),
    quote: text("quote"),
    sortOrder: integer("sort_order").notNull().default(0),
    isFeaturedHomepage: boolean("is_featured_homepage").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("session_role_person_id_idx").on(table.personId),
    index("session_role_session_id_idx").on(table.sessionId),
    index("session_role_department_id_idx").on(table.departmentId),
    unique("session_role_identity_unique").on(
      table.personId,
      table.sessionId,
      table.tier,
      table.roleTitle,
    ),
  ],
);

/* -------------------------------------------------------------------------- */
/* Content                                                                    */
/* -------------------------------------------------------------------------- */

export const project = pgTable(
  "project",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 128 }).notNull().unique(),
    title: varchar("title", { length: 255 }).notNull(),
    tagline: varchar("tagline", { length: 255 }).notNull(),
    descriptionJson: jsonb("description_json").$type<RichTextDoc>().notNull(),
    departmentId: uuid("department_id")
      .notNull()
      .references(() => department.id),
    sessionId: uuid("session_id").references(() => schoolSession.id, { onDelete: "set null" }),
    category: text("category", { enum: projectCategories }).notNull(),
    courseCode: varchar("course_code", { length: 32 }),
    cohortGroupNumber: integer("cohort_group_number"),
    teamDisplayName: varchar("team_display_name", { length: 128 }),
    leadContributors: jsonb("lead_contributors")
      .$type<LeadContributor[]>()
      .notNull()
      .default([]),
    status: text("status", { enum: ["draft", "submitted", "approved", "rejected"] })
      .notNull()
      .default("draft"),
    rejectionReason: text("rejection_reason"),
    authorUserId: uuid("author_user_id")
      .notNull()
      .references(() => user.id),
    bannerUrl: text("banner_url"),
    bannerPublicId: varchar("banner_public_id", { length: 255 }),
    galleryUrls: jsonb("gallery_urls").$type<string[]>().notNull().default([]),
    repoUrl: text("repo_url"),
    demoUrl: text("demo_url"),
    featured: boolean("featured").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("project_department_id_idx").on(table.departmentId),
    index("project_session_id_idx").on(table.sessionId),
    index("project_author_user_id_idx").on(table.authorUserId),
    index("project_status_idx").on(table.status),
  ],
);

export const opportunity = pgTable(
  "opportunity",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 128 }).notNull().unique(),
    title: varchar("title", { length: 255 }).notNull(),
    orgName: varchar("org_name", { length: 128 }).notNull(),
    orgUrl: text("org_url"),
    orgLogoUrl: text("org_logo_url"),
    scopeType: text("scope_type", { enum: ["faculty", "department", "session"] })
      .notNull()
      .default("faculty"),
    departmentId: uuid("department_id").references(() => department.id, { onDelete: "set null" }),
    sessionId: uuid("session_id").references(() => schoolSession.id, { onDelete: "set null" }),
    type: text("type", { enum: opportunityTypes }).notNull(),
    location: varchar("location", { length: 128 }).notNull(),
    descriptionJson: jsonb("description_json").$type<RichTextDoc>().notNull(),
    applyUrl: text("apply_url").notNull(),
    deadline: timestamp("deadline", { withTimezone: true }),
    status: text("status", { enum: opportunityStatuses }).notNull().default("draft"),
    rejectionReason: text("rejection_reason"),
    submittedByUserId: uuid("submitted_by_user_id")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("opportunity_department_id_idx").on(table.departmentId),
    index("opportunity_type_idx").on(table.type),
    index("opportunity_status_idx").on(table.status),
  ],
);

export const goodwillMessage = pgTable(
  "goodwill_message",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    personId: uuid("person_id").references(() => person.id, { onDelete: "set null" }),
    staffId: uuid("staff_id").references(() => facultyStaff.id, { onDelete: "set null" }),
    guestAuthor: jsonb("guest_author").$type<GuestAuthor | null>(),
    messageJson: jsonb("message_json").$type<RichTextDoc>().notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .defaultNow()
      .notNull(),
  },
  (table) => [index("goodwill_message_person_id_idx").on(table.personId)],
);

export const platformSetting = pgTable("platform_setting", {
  key: varchar("key", { length: 64 }).primaryKey(),
  valueJson: jsonb("value_json").$type<PlatformSettingValue>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .defaultNow()
    .notNull(),
});

export const event = pgTable(
  "event",
  {
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
    authorUserId: uuid("author_user_id")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .defaultNow()
      .notNull(),
  },
  (table) => [index("event_start_date_idx").on(table.startDate)],
);

export const post = pgTable(
  "post",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 128 }).notNull().unique(),
    title: varchar("title", { length: 255 }).notNull(),
    excerpt: text("excerpt").notNull(),
    bodyJson: jsonb("body_json").$type<RichTextDoc>().notNull(),
    status: text("status", { enum: ["draft", "scheduled", "published"] })
      .notNull()
      .default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    featured: boolean("featured").notNull().default(false),
    authorUserId: uuid("author_user_id")
      .notNull()
      .references(() => user.id),
    coverUrl: text("cover_url"),
    coverPublicId: varchar("cover_public_id", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("post_author_user_id_idx").on(table.authorUserId),
    index("post_status_idx").on(table.status),
  ],
);

export const slugRedirect = pgTable("slug_redirect", {
  id: uuid("id").primaryKey().defaultRandom(),
  entityType: text("entity_type", { enum: ["post", "event", "project", "person"] }).notNull(),
  oldSlug: varchar("old_slug", { length: 128 }).notNull().unique(),
  targetSlug: varchar("target_slug", { length: 128 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* -------------------------------------------------------------------------- */
/* Relations                                                                  */
/* -------------------------------------------------------------------------- */

export const facultyStaffRelations = relations(facultyStaff, ({ one, many }) => ({
  department: one(department, {
    fields: [facultyStaff.departmentId],
    references: [department.id],
    relationName: "departmentStaff",
  }),
  headedDepartments: many(department, { relationName: "departmentHead" }),
  goodwillMessages: many(goodwillMessage),
}));

export const departmentRelations = relations(department, ({ one, many }) => ({
  hod: one(facultyStaff, {
    fields: [department.hodStaffId],
    references: [facultyStaff.id],
    relationName: "departmentHead",
  }),
  staff: many(facultyStaff, { relationName: "departmentStaff" }),
  users: many(user),
  sessionRoles: many(sessionRole),
  projects: many(project),
  opportunities: many(opportunity),
}));

export const userRelations = relations(user, ({ one, many }) => ({
  department: one(department, {
    fields: [user.departmentId],
    references: [department.id],
  }),
  sessions: many(session),
  accounts: many(account),
  claimedPersons: many(person),
  authoredProjects: many(project),
  submittedOpportunities: many(opportunity),
  authoredPosts: many(post),
  authoredEvents: many(event),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const verificationRelations = relations(verification, () => ({}));

export const schoolSessionRelations = relations(schoolSession, ({ many }) => ({
  sessionRoles: many(sessionRole),
  projects: many(project),
  opportunities: many(opportunity),
}));

export const personRelations = relations(person, ({ one, many }) => ({
  claimedBy: one(user, { fields: [person.claimedByUserId], references: [user.id] }),
  sessionRoles: many(sessionRole),
  goodwillMessages: many(goodwillMessage),
}));

export const sessionRoleRelations = relations(sessionRole, ({ one }) => ({
  person: one(person, { fields: [sessionRole.personId], references: [person.id] }),
  schoolSession: one(schoolSession, {
    fields: [sessionRole.sessionId],
    references: [schoolSession.id],
  }),
  department: one(department, {
    fields: [sessionRole.departmentId],
    references: [department.id],
  }),
}));

export const projectRelations = relations(project, ({ one }) => ({
  department: one(department, {
    fields: [project.departmentId],
    references: [department.id],
  }),
  schoolSession: one(schoolSession, {
    fields: [project.sessionId],
    references: [schoolSession.id],
  }),
  author: one(user, { fields: [project.authorUserId], references: [user.id] }),
}));

export const opportunityRelations = relations(opportunity, ({ one }) => ({
  department: one(department, {
    fields: [opportunity.departmentId],
    references: [department.id],
  }),
  schoolSession: one(schoolSession, {
    fields: [opportunity.sessionId],
    references: [schoolSession.id],
  }),
  submittedBy: one(user, {
    fields: [opportunity.submittedByUserId],
    references: [user.id],
  }),
}));

export const goodwillMessageRelations = relations(goodwillMessage, ({ one }) => ({
  person: one(person, { fields: [goodwillMessage.personId], references: [person.id] }),
  staff: one(facultyStaff, {
    fields: [goodwillMessage.staffId],
    references: [facultyStaff.id],
  }),
}));

export const platformSettingRelations = relations(platformSetting, () => ({}));

export const eventRelations = relations(event, ({ one }) => ({
  author: one(user, { fields: [event.authorUserId], references: [user.id] }),
}));

export const postRelations = relations(post, ({ one }) => ({
  author: one(user, { fields: [post.authorUserId], references: [user.id] }),
}));

export const slugRedirectRelations = relations(slugRedirect, () => ({}));
