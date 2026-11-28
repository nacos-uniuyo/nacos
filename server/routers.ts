import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { leadContributor, type PlatformSettingValue, richTextDoc } from "@/db/json";
import {
  department,
  facultyStaff,
  opportunity,
  opportunityBookmark,
  person,
  platformSetting,
  project,
  schoolSession,
  user,
} from "@/db/schema";
import { richTextDocToText } from "@/lib/richtext";
import { generateUniqueSlug } from "@/lib/slug";
import {
  departments,
  events,
  goodwill,
  opportunities,
  posts,
  projects,
  roster,
  schoolSessions,
} from "@/mocks/portal";
import {
  deansMessageInput,
  deansMessageSummary,
  departmentSummary,
  eventSummary,
  goodwillSummary,
  opportunitySummary,
  opportunityType,
  personSummary,
  postSummary,
  projectCategory,
  projectSummary,
  schoolSessionSummary,
} from "./contracts";
import { DEANS_MESSAGE_KEY, getDeansMessage } from "./queries/leadership";
import { coordinatorRouter } from "./routers/coordinator";
import {
  adminProcedure,
  assertDepartmentScope,
  departmentEditorProcedure,
  protectedProcedure,
  publicProcedure,
  router,
} from "./trpc";

/**
 * Phase 1 contracts & Phase 4 Member Dashboard backend.
 * Public and preview procedures continue reading from mocks/portal.ts until
 * Phase 3 live query cutover, while Phase 4 Member Dashboard mutations and
 * member-specific reads interact with Neon PostgreSQL through Drizzle ORM.
 */

function bySlug<T extends { slug: string }>(
  items: T[],
  slug: string,
  contract: z.ZodType<T>,
) {
  const found = items.find((item) => item.slug === slug);
  return found ? contract.parse(found) : null;
}

/**
 * Resolves a department ID whether provided as a UUID or a slug (e.g. "computer-science").
 */
async function resolveDepartmentId(idOrSlug: string): Promise<string | null> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  const [dept] = await db
    .select({ id: department.id })
    .from(department)
    .where(isUuid ? eq(department.id, idOrSlug) : eq(department.slug, idOrSlug))
    .limit(1);

  return dept?.id ?? null;
}

/**
 * Resolves a session ID whether provided as a UUID or a slug (e.g. "2024-2025").
 */
async function resolveSessionId(idOrSlug: string): Promise<string | null> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  const [sess] = await db
    .select({ id: schoolSession.id })
    .from(schoolSession)
    .where(isUuid ? eq(schoolSession.id, idOrSlug) : eq(schoolSession.slug, idOrSlug))
    .limit(1);

  return sess?.id ?? null;
}

/* -------------------------------------------------------------------------- */
/* User Profile & Dashboard Overview (Phase 4)                                */
/* -------------------------------------------------------------------------- */

const userRouter = router({
  searchMembers: protectedProcedure
    .input(z.object({ query: z.string().trim().max(100).default("") }))
    .query(async ({ input }) => {
      const q = input.query;
      const rows = await db
        .select({
          id: user.id,
          name: user.name,
          image: user.image,
          regNumber: user.regNumber,
        })
        .from(user)
        .where(
          q
            ? or(
                ilike(user.name, `%${q}%`),
                ilike(user.email, `%${q}%`),
                ilike(user.regNumber, `%${q}%`),
              )
            : undefined,
        )
        .limit(12);
      return rows;
    }),
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const [row] = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        departmentId: user.departmentId,
        departmentName: department.name,
        departmentSlug: department.slug,
        regNumber: user.regNumber,
        createdAt: user.createdAt,
      })
      .from(user)
      .leftJoin(department, eq(user.departmentId, department.id))
      .where(eq(user.id, ctx.session.userId))
      .limit(1);

    if (!row) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User profile not found." });
    }

    const [claimedPerson] = await db
      .select({
        id: person.id,
        slug: person.slug,
        fullName: person.fullName,
        photoUrl: person.photoUrl,
        currentRole: person.currentRole,
      })
      .from(person)
      .where(eq(person.claimedByUserId, ctx.session.userId))
      .limit(1);

    return {
      ...row,
      claimedPerson: claimedPerson ?? null,
    };
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().trim().min(2, "Name must be at least 2 characters").max(128),
        departmentId: z.string().nullable().optional(),
        regNumber: z
          .string()
          .trim()
          .max(32, "Registration number must not exceed 32 characters")
          .nullable()
          .optional()
          .or(z.literal("")),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let resolvedDeptId: string | null = null;
      if (input.departmentId) {
        resolvedDeptId = await resolveDepartmentId(input.departmentId);
        if (!resolvedDeptId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Selected department does not exist." });
        }
      }

      // Security: Department editors and admins cannot alter their department assignment via member profile
      const isPrivileged = ctx.session.role === "department_editor" || ctx.session.role === "admin";
      const updateData: { name: string; departmentId?: string | null; regNumber?: string | null } = {
        name: input.name,
      };

      if (!isPrivileged && input.departmentId !== undefined) {
        updateData.departmentId = input.departmentId ? resolvedDeptId : null;
      }

      if (input.regNumber !== undefined) {
        updateData.regNumber = input.regNumber === "" ? null : input.regNumber;
      }

      const [updated] = await db
        .update(user)
        .set(updateData)
        .where(eq(user.id, ctx.session.userId))
        .returning({
          id: user.id,
          name: user.name,
          email: user.email,
          departmentId: user.departmentId,
          regNumber: user.regNumber,
        });

      return updated;
    }),

  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.userId;

    const [userRow] = await db
      .select({
        departmentId: user.departmentId,
        regNumber: user.regNumber,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    const [projectsCountRow] = await db
      .select({ count: count() })
      .from(project)
      .where(eq(project.authorUserId, userId));

    const [approvedProjectsRow] = await db
      .select({ count: count() })
      .from(project)
      .where(and(eq(project.authorUserId, userId), eq(project.status, "approved")));

    const [pendingProjectsRow] = await db
      .select({ count: count() })
      .from(project)
      .where(and(eq(project.authorUserId, userId), eq(project.status, "submitted")));

    const [opportunitiesCountRow] = await db
      .select({ count: count() })
      .from(opportunity)
      .where(eq(opportunity.submittedByUserId, userId));

    const [bookmarksCountRow] = await db
      .select({ count: count() })
      .from(opportunityBookmark)
      .where(eq(opportunityBookmark.userId, userId));

    return {
      submittedProjectsCount: Number(projectsCountRow?.count ?? 0),
      approvedProjectsCount: Number(approvedProjectsRow?.count ?? 0),
      pendingProjectsCount: Number(pendingProjectsRow?.count ?? 0),
      submittedOpportunitiesCount: Number(opportunitiesCountRow?.count ?? 0),
      savedBookmarksCount: Number(bookmarksCountRow?.count ?? 0),
      hasCompletedProfile: Boolean(userRow?.regNumber && userRow?.departmentId),
    };
  }),
});

/* -------------------------------------------------------------------------- */
/* Department Router                                                          */
/* -------------------------------------------------------------------------- */

const departmentRouter = router({
  list: publicProcedure.query(async () => {
    const rows = await db
      .select({
        slug: department.slug,
        name: department.name,
        shortName: department.shortName,
        descriptionJson: department.descriptionJson,
        hodName: facultyStaff.fullName,
        sortOrder: department.sortOrder,
      })
      .from(department)
      .leftJoin(facultyStaff, eq(department.hodStaffId, facultyStaff.id))
      .orderBy(department.sortOrder);

    return z.array(departmentSummary).parse(
      rows.map((row) => ({
        slug: row.slug,
        name: row.name,
        shortName: row.shortName,
        summary: row.descriptionJson ? richTextDocToText(row.descriptionJson) : row.name,
        hodName: row.hodName ?? null,
      })),
    );
  }),
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const [row] = await db
        .select({
          slug: department.slug,
          name: department.name,
          shortName: department.shortName,
          descriptionJson: department.descriptionJson,
          hodName: facultyStaff.fullName,
        })
        .from(department)
        .leftJoin(facultyStaff, eq(department.hodStaffId, facultyStaff.id))
        .where(eq(department.slug, input.slug))
        .limit(1);

      if (!row) return null;

      return departmentSummary.parse({
        slug: row.slug,
        name: row.name,
        shortName: row.shortName,
        summary: row.descriptionJson ? richTextDocToText(row.descriptionJson) : row.name,
        hodName: row.hodName ?? null,
      });
    }),
});

/* -------------------------------------------------------------------------- */
/* Academic Session Router                                                    */
/* -------------------------------------------------------------------------- */

const sessionRouter = router({
  list: publicProcedure.query(async () => {
    const rows = await db
      .select({
        slug: schoolSession.slug,
        name: schoolSession.name,
        theme: schoolSession.theme,
        isCurrent: schoolSession.isCurrent,
      })
      .from(schoolSession)
      .orderBy(desc(schoolSession.isCurrent), desc(schoolSession.createdAt));

    return z.array(schoolSessionSummary).parse(rows);
  }),
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const [row] = await db
        .select({
          slug: schoolSession.slug,
          name: schoolSession.name,
          theme: schoolSession.theme,
          isCurrent: schoolSession.isCurrent,
        })
        .from(schoolSession)
        .where(eq(schoolSession.slug, input.slug))
        .limit(1);

      return row ? schoolSessionSummary.parse(row) : null;
    }),
  current: publicProcedure.query(async () => {
    const [row] = await db
      .select({
        slug: schoolSession.slug,
        name: schoolSession.name,
        theme: schoolSession.theme,
        isCurrent: schoolSession.isCurrent,
      })
      .from(schoolSession)
      .where(eq(schoolSession.isCurrent, true))
      .limit(1);

    return row ? schoolSessionSummary.parse(row) : null;
  }),
});

/* -------------------------------------------------------------------------- */
/* Roster Router                                                              */
/* -------------------------------------------------------------------------- */

const rosterRouter = router({
  list: publicProcedure.query(() => {
    return z.array(personSummary).parse(roster);
  }),
  bySession: publicProcedure
    .input(z.object({ sessionSlug: z.string() }))
    .query(({ input }) => {
      const people = roster.filter((p) => p.sessionSlug === input.sessionSlug);
      return z.array(personSummary).parse(people);
    }),
  alumni: publicProcedure.query(() => {
    const people = roster.filter((p) => p.tier === "alumni");
    return z.array(personSummary).parse(people);
  }),
  staff: publicProcedure.query(() => {
    const people = roster.filter((p) => p.tier === "staff");
    return z.array(personSummary).parse(people);
  }),
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ input }) => bySlug(roster, input.slug, personSummary)),
  /** Curated in the admin console later; the flag is on the record, not a guess. */
  featured: publicProcedure.query(() => {
    const people = roster.filter((p) => p.isFeaturedHomepage);
    return z.array(personSummary).parse(people);
  }),
});

/* -------------------------------------------------------------------------- */
/* Project Showcase & Proposals Router (Phase 4 Extended)                     */
/* -------------------------------------------------------------------------- */

const projectRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          departmentSlug: z.string().optional(),
          category: projectCategory.optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const conditions = [eq(project.status, "approved")];
      if (input?.departmentSlug) {
        conditions.push(eq(department.slug, input.departmentSlug));
      }
      if (input?.category) {
        conditions.push(eq(project.category, input.category));
      }

      const rows = await db
        .select({
          slug: project.slug,
          title: project.title,
          tagline: project.tagline,
          category: project.category,
          departmentSlug: department.slug,
          courseCode: project.courseCode,
          teamDisplayName: project.teamDisplayName,
          repoUrl: project.repoUrl,
          demoUrl: project.demoUrl,
          featured: project.featured,
          bannerUrl: project.bannerUrl,
          createdAt: project.createdAt,
        })
        .from(project)
        .innerJoin(department, eq(project.departmentId, department.id))
        .where(and(...conditions))
        .orderBy(desc(project.featured), desc(project.createdAt));

      return z.array(projectSummary).parse(
        rows.map((row) => ({
          ...row,
          createdAt: row.createdAt.toISOString(),
        })),
      );
    }),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const [row] = await db
        .select({
          slug: project.slug,
          title: project.title,
          tagline: project.tagline,
          category: project.category,
          departmentSlug: department.slug,
          courseCode: project.courseCode,
          teamDisplayName: project.teamDisplayName,
          repoUrl: project.repoUrl,
          demoUrl: project.demoUrl,
          featured: project.featured,
          bannerUrl: project.bannerUrl,
          descriptionJson: project.descriptionJson,
          galleryUrls: project.galleryUrls,
          leadContributors: project.leadContributors,
          sessionSlug: schoolSession.slug,
          createdAt: project.createdAt,
          status: project.status,
        })
        .from(project)
        .innerJoin(department, eq(project.departmentId, department.id))
        .leftJoin(schoolSession, eq(project.sessionId, schoolSession.id))
        .where(eq(project.slug, input.slug))
        .limit(1);

      if (!row || row.status !== "approved") return null;

      return projectSummary.parse({
        ...row,
        createdAt: row.createdAt.toISOString(),
      });
    }),

  /** Scoped to the editor's own department; admins pass. */
  review: departmentEditorProcedure
    .input(
      z.object({
        slug: z.string(),
        status: z.enum(["approved", "rejected"]),
        rejectionReason: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [found] = await db
        .select({
          id: project.id,
          slug: project.slug,
          departmentSlug: department.slug,
        })
        .from(project)
        .innerJoin(department, eq(project.departmentId, department.id))
        .where(eq(project.slug, input.slug))
        .limit(1);

      if (!found) throw new TRPCError({ code: "NOT_FOUND", message: "No such project." });
      assertDepartmentScope(ctx.session, found.departmentSlug);
      if (input.status === "rejected" && !input.rejectionReason) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "A rejection needs a reason." });
      }

      await db
        .update(project)
        .set({
          status: input.status,
          rejectionReason: input.status === "rejected" ? input.rejectionReason ?? null : null,
        })
        .where(eq(project.id, found.id));

      return { slug: found.slug, status: input.status };
    }),

  /** Phase 4: Submit a project proposal */
  submit: protectedProcedure
    .input(
      z.object({
        title: z.string().trim().min(3, "Title must be at least 3 characters").max(255),
        tagline: z.string().trim().min(5, "Tagline must be at least 5 characters").max(255),
        descriptionJson: richTextDoc,
        departmentId: z.string().min(1, "Please select a valid department"),
        sessionId: z.string().nullable().optional(),
        category: projectCategory,
        courseCode: z.string().trim().max(32).nullable().optional(),
        cohortGroupNumber: z.number().int().min(1).max(50).nullable().optional(),
        teamDisplayName: z.string().trim().max(128).nullable().optional(),
        leadContributors: z.array(leadContributor).default([]),
        bannerUrl: z.string().url().nullable().optional(),
        bannerPublicId: z.string().max(255).nullable().optional(),
        galleryUrls: z.array(z.string().url()).default([]),
        repoUrl: z.string().url().nullable().optional().or(z.literal("")),
        demoUrl: z.string().url().nullable().optional().or(z.literal("")),
        saveAsDraft: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const resolvedDeptId = await resolveDepartmentId(input.departmentId);
      if (!resolvedDeptId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Selected department does not exist." });
      }

      const resolvedSessionId = input.sessionId ? await resolveSessionId(input.sessionId) : null;
      const slug = generateUniqueSlug(input.title);
      const status = input.saveAsDraft ? "draft" : "submitted";

      const [created] = await db
        .insert(project)
        .values({
          slug,
          title: input.title,
          tagline: input.tagline,
          descriptionJson: input.descriptionJson,
          departmentId: resolvedDeptId,
          sessionId: resolvedSessionId,
          category: input.category,
          courseCode: input.courseCode || null,
          cohortGroupNumber: input.cohortGroupNumber ?? null,
          teamDisplayName: input.teamDisplayName || null,
          leadContributors: input.leadContributors,
          bannerUrl: input.bannerUrl || null,
          bannerPublicId: input.bannerPublicId || null,
          galleryUrls: input.galleryUrls,
          repoUrl: input.repoUrl || null,
          demoUrl: input.demoUrl || null,
          status,
          authorUserId: ctx.session.userId,
        })
        .returning({
          id: project.id,
          slug: project.slug,
          status: project.status,
          title: project.title,
        });

      return created;
    }),

  /** Phase 4: Retrieve current user's submitted projects */
  mySubmissions: protectedProcedure
    .input(
      z
        .object({
          status: z.enum(["draft", "submitted", "approved", "rejected"]).optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(project.authorUserId, ctx.session.userId)];
      if (input?.status) {
        conditions.push(eq(project.status, input.status));
      }

      const rows = await db
        .select({
          id: project.id,
          slug: project.slug,
          title: project.title,
          tagline: project.tagline,
          category: project.category,
          departmentId: project.departmentId,
          departmentName: department.name,
          departmentSlug: department.slug,
          status: project.status,
          rejectionReason: project.rejectionReason,
          bannerUrl: project.bannerUrl,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        })
        .from(project)
        .leftJoin(department, eq(project.departmentId, department.id))
        .where(and(...conditions))
        .orderBy(desc(project.createdAt));

      return rows;
    }),

  /** Phase 4: Retrieve one owned project proposal for editing */
  getMySubmission: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [row] = await db
        .select({
          id: project.id,
          slug: project.slug,
          title: project.title,
          tagline: project.tagline,
          descriptionJson: project.descriptionJson,
          departmentId: project.departmentId,
          departmentSlug: department.slug,
          sessionId: project.sessionId,
          sessionSlug: schoolSession.slug,
          category: project.category,
          courseCode: project.courseCode,
          teamDisplayName: project.teamDisplayName,
          leadContributors: project.leadContributors,
          status: project.status,
          rejectionReason: project.rejectionReason,
          bannerUrl: project.bannerUrl,
          bannerPublicId: project.bannerPublicId,
          repoUrl: project.repoUrl,
          demoUrl: project.demoUrl,
        })
        .from(project)
        .leftJoin(department, eq(project.departmentId, department.id))
        .leftJoin(schoolSession, eq(project.sessionId, schoolSession.id))
        .where(and(eq(project.id, input.id), eq(project.authorUserId, ctx.session.userId)))
        .limit(1);

      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project proposal not found." });
      }

      return row;
    }),

  /** Phase 4: Update an owned project proposal */
  updateMySubmission: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().trim().min(3).max(255),
        tagline: z.string().trim().min(5).max(255),
        descriptionJson: richTextDoc,
        departmentId: z.string().min(1),
        sessionId: z.string().nullable().optional(),
        category: projectCategory,
        courseCode: z.string().trim().max(32).nullable().optional(),
        cohortGroupNumber: z.number().int().min(1).max(50).nullable().optional(),
        teamDisplayName: z.string().trim().max(128).nullable().optional(),
        leadContributors: z.array(leadContributor).default([]),
        bannerUrl: z.string().url().nullable().optional(),
        bannerPublicId: z.string().max(255).nullable().optional(),
        galleryUrls: z.array(z.string().url()).default([]),
        repoUrl: z.string().url().nullable().optional().or(z.literal("")),
        demoUrl: z.string().url().nullable().optional().or(z.literal("")),
        submitForReview: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [existing] = await db
        .select()
        .from(project)
        .where(eq(project.id, input.id))
        .limit(1);

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project proposal not found." });
      }

      if (existing.authorUserId !== ctx.session.userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only modify your own submissions." });
      }

      if (existing.status === "approved") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Approved projects cannot be modified directly.",
        });
      }

      const resolvedDeptId = await resolveDepartmentId(input.departmentId);
      if (!resolvedDeptId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Selected department does not exist." });
      }
      const resolvedSessionId = input.sessionId ? await resolveSessionId(input.sessionId) : null;

      let newStatus = existing.status;
      let newRejectionReason = existing.rejectionReason;

      if (input.submitForReview) {
        newStatus = "submitted";
        newRejectionReason = null;
      }

      const [updated] = await db
        .update(project)
        .set({
          title: input.title,
          tagline: input.tagline,
          descriptionJson: input.descriptionJson,
          departmentId: resolvedDeptId,
          sessionId: resolvedSessionId,
          category: input.category,
          courseCode: input.courseCode || null,
          cohortGroupNumber: input.cohortGroupNumber ?? null,
          teamDisplayName: input.teamDisplayName || null,
          leadContributors: input.leadContributors,
          bannerUrl: input.bannerUrl || null,
          bannerPublicId: input.bannerPublicId || null,
          galleryUrls: input.galleryUrls,
          repoUrl: input.repoUrl || null,
          demoUrl: input.demoUrl || null,
          status: newStatus,
          rejectionReason: newRejectionReason,
        })
        .where(eq(project.id, input.id))
        .returning({
          id: project.id,
          slug: project.slug,
          status: project.status,
          title: project.title,
        });

      return updated;
    }),
});

/* -------------------------------------------------------------------------- */
/* Opportunities & Bookmarks Router (Phase 4 Extended)                        */
/* -------------------------------------------------------------------------- */

const opportunityRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          type: opportunityType.optional(),
          departmentSlug: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const conditions = [eq(opportunity.status, "approved")];
      if (input?.type) conditions.push(eq(opportunity.type, input.type));
      if (input?.departmentSlug) conditions.push(eq(department.slug, input.departmentSlug));

      const rows = await db
        .select({
          slug: opportunity.slug,
          title: opportunity.title,
          orgName: opportunity.orgName,
          type: opportunity.type,
          departmentSlug: department.slug,
          location: opportunity.location,
          deadline: opportunity.deadline,
          applyUrl: opportunity.applyUrl,
          hasInternalDetails: opportunity.hasInternalDetails,
          orgUrl: opportunity.orgUrl,
          orgLogoUrl: opportunity.orgLogoUrl,
          descriptionJson: opportunity.descriptionJson,
        })
        .from(opportunity)
        .leftJoin(department, eq(opportunity.departmentId, department.id))
        .where(and(...conditions))
        .orderBy(desc(opportunity.deadline), desc(opportunity.createdAt));

      return z.array(opportunitySummary).parse(
        rows.map((row) => ({
          slug: row.slug,
          title: row.title,
          orgName: row.orgName,
          type: row.type,
          departmentSlug: row.departmentSlug ?? null,
          location: row.location,
          deadline: row.deadline ? row.deadline.toISOString() : null,
          applyUrl: row.applyUrl ?? null,
          hasInternalDetails: row.hasInternalDetails,
          imageUrl: row.orgLogoUrl ?? null,
          orgLogoUrl: row.orgLogoUrl ?? null,
          orgUrl: row.orgUrl ?? null,
          descriptionJson: row.descriptionJson,
        })),
      );
    }),

  /** Phase 4: Submit an opportunity listing */
  submit: protectedProcedure
    .input(
      z.object({
        title: z.string().trim().min(3).max(255),
        orgName: z.string().trim().min(2).max(128),
        orgUrl: z.string().url().nullable().optional().or(z.literal("")),
        orgLogoUrl: z.string().url().nullable().optional().or(z.literal("")),
        scopeType: z.enum(["faculty", "department", "session"]).default("faculty"),
        departmentId: z.string().nullable().optional(),
        sessionId: z.string().nullable().optional(),
        type: opportunityType,
        location: z.string().trim().min(2).max(128),
        descriptionJson: richTextDoc,
        applyUrl: z.string().url("A valid application URL is required").nullable().optional(),
        hasInternalDetails: z.boolean().default(false),
        deadline: z.string().datetime().nullable().optional(),
        saveAsDraft: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const resolvedDeptId = input.departmentId ? await resolveDepartmentId(input.departmentId) : null;
      const resolvedSessionId = input.sessionId ? await resolveSessionId(input.sessionId) : null;

      const slug = generateUniqueSlug(input.title);
      const status = input.saveAsDraft ? "draft" : "submitted";

      const [created] = await db
        .insert(opportunity)
        .values({
          slug,
          title: input.title,
          orgName: input.orgName,
          orgUrl: input.orgUrl || null,
          orgLogoUrl: input.orgLogoUrl || null,
          scopeType: input.scopeType,
          departmentId: resolvedDeptId,
          sessionId: resolvedSessionId,
          type: input.type,
          location: input.location,
          descriptionJson: input.descriptionJson,
          applyUrl: input.applyUrl || null,
          hasInternalDetails: input.hasInternalDetails,
          deadline: input.deadline ? new Date(input.deadline) : null,
          status,
          submittedByUserId: ctx.session.userId,
        })
        .returning({
          id: opportunity.id,
          slug: opportunity.slug,
          status: opportunity.status,
          title: opportunity.title,
        });

      return created;
    }),

  /** Phase 4: Retrieve current user's submitted opportunities */
  mySubmissions: protectedProcedure.query(async ({ ctx }) => {
    const rows = await db
      .select({
        id: opportunity.id,
        slug: opportunity.slug,
        title: opportunity.title,
        orgName: opportunity.orgName,
        type: opportunity.type,
        location: opportunity.location,
        status: opportunity.status,
        rejectionReason: opportunity.rejectionReason,
        applyUrl: opportunity.applyUrl,
        deadline: opportunity.deadline,
        createdAt: opportunity.createdAt,
      })
      .from(opportunity)
      .where(eq(opportunity.submittedByUserId, ctx.session.userId))
      .orderBy(desc(opportunity.createdAt));

    return rows;
  }),

  /** Phase 4: Toggle bookmark for an opportunity */
  toggleBookmark: protectedProcedure
    .input(z.object({ opportunityId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.userId;

      const [opp] = await db
        .select({ id: opportunity.id })
        .from(opportunity)
        .where(eq(opportunity.id, input.opportunityId))
        .limit(1);

      if (!opp) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Opportunity not found." });
      }

      const [existing] = await db
        .select({ id: opportunityBookmark.id })
        .from(opportunityBookmark)
        .where(
          and(
            eq(opportunityBookmark.userId, userId),
            eq(opportunityBookmark.opportunityId, input.opportunityId),
          ),
        )
        .limit(1);

      if (existing) {
        await db
          .delete(opportunityBookmark)
          .where(eq(opportunityBookmark.id, existing.id));

        return { bookmarked: false };
      }

      await db.insert(opportunityBookmark).values({
        userId,
        opportunityId: input.opportunityId,
      });

      return { bookmarked: true };
    }),

  /** Phase 4: List bookmarked opportunities for current user */
  myBookmarks: protectedProcedure.query(async ({ ctx }) => {
    const rows = await db
      .select({
        bookmarkId: opportunityBookmark.id,
        bookmarkedAt: opportunityBookmark.createdAt,
        opportunity: {
          id: opportunity.id,
          slug: opportunity.slug,
          title: opportunity.title,
          orgName: opportunity.orgName,
          orgLogoUrl: opportunity.orgLogoUrl,
          type: opportunity.type,
          location: opportunity.location,
          deadline: opportunity.deadline,
          applyUrl: opportunity.applyUrl,
          status: opportunity.status,
        },
      })
      .from(opportunityBookmark)
      .innerJoin(opportunity, eq(opportunityBookmark.opportunityId, opportunity.id))
      .where(eq(opportunityBookmark.userId, ctx.session.userId))
      .orderBy(desc(opportunityBookmark.createdAt));

    return rows;
  }),

  /** Phase 4: Check if specific opportunity is bookmarked by user */
  isBookmarked: protectedProcedure
    .input(z.object({ opportunityId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [existing] = await db
        .select({ id: opportunityBookmark.id })
        .from(opportunityBookmark)
        .where(
          and(
            eq(opportunityBookmark.userId, ctx.session.userId),
            eq(opportunityBookmark.opportunityId, input.opportunityId),
          ),
        )
        .limit(1);

      return { isBookmarked: Boolean(existing) };
    }),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const [row] = await db
        .select({
          slug: opportunity.slug,
          title: opportunity.title,
          orgName: opportunity.orgName,
          type: opportunity.type,
          departmentSlug: department.slug,
          location: opportunity.location,
          deadline: opportunity.deadline,
          applyUrl: opportunity.applyUrl,
          hasInternalDetails: opportunity.hasInternalDetails,
          orgUrl: opportunity.orgUrl,
          orgLogoUrl: opportunity.orgLogoUrl,
          descriptionJson: opportunity.descriptionJson,
          status: opportunity.status,
        })
        .from(opportunity)
        .leftJoin(department, eq(opportunity.departmentId, department.id))
        .where(eq(opportunity.slug, input.slug))
        .limit(1);

      if (!row || row.status !== "approved") return null;

      return opportunitySummary.parse({
        slug: row.slug,
        title: row.title,
        orgName: row.orgName,
        type: row.type,
        departmentSlug: row.departmentSlug ?? null,
        location: row.location,
        deadline: row.deadline ? row.deadline.toISOString() : null,
        applyUrl: row.applyUrl ?? null,
        hasInternalDetails: row.hasInternalDetails,
        imageUrl: row.orgLogoUrl ?? null,
        orgLogoUrl: row.orgLogoUrl ?? null,
        orgUrl: row.orgUrl ?? null,
        descriptionJson: row.descriptionJson,
      });
    }),
});

/* -------------------------------------------------------------------------- */
/* Events, Posts, Goodwill, Settings, Admin Routers                           */
/* -------------------------------------------------------------------------- */

const eventRouter = router({
  list: publicProcedure.query(() => z.array(eventSummary).parse(events)),
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ input }) => bySlug(events, input.slug, eventSummary)),
});

const postRouter = router({
  list: publicProcedure
    .input(z.object({ featuredOnly: z.boolean().optional() }).optional())
    .query(({ input }) => {
      const filtered = input?.featuredOnly ? posts.filter((p) => p.featured) : posts;
      return z.array(postSummary).parse(filtered);
    }),
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ input }) => bySlug(posts, input.slug, postSummary)),
});

const goodwillRouter = router({
  list: publicProcedure.query(() => z.array(goodwillSummary).parse(goodwill)),
});

const settingRouter = router({
  deansMessage: publicProcedure.query(() => getDeansMessage()),
});

const adminRouter = router({
  /** Saves the Dean's message and refreshes the prerendered homepage that shows it. */
  updateDeansMessage: adminProcedure.input(deansMessageInput).mutation(async ({ input }) => {
    const valueJson = { kind: "deans_message", ...input } satisfies PlatformSettingValue;

    await db
      .insert(platformSetting)
      .values({ key: DEANS_MESSAGE_KEY, valueJson })
      .onConflictDoUpdate({
        target: platformSetting.key,
        set: { valueJson, updatedAt: new Date() },
      });

    revalidatePath("/");
    return deansMessageSummary.parse(input);
  }),
});

/* -------------------------------------------------------------------------- */
/* Main Application Router                                                    */
/* -------------------------------------------------------------------------- */

export const appRouter = router({
  user: userRouter,
  coordinator: coordinatorRouter,
  department: departmentRouter,
  session: sessionRouter,
  roster: rosterRouter,
  project: projectRouter,
  opportunity: opportunityRouter,
  event: eventRouter,
  post: postRouter,
  goodwill: goodwillRouter,
  setting: settingRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
