import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, ilike, isNotNull, isNull, ne, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { richTextDoc } from "@/db/json";
import {
  department,
  departmentNotice,
  opportunity,
  project,
  schoolSession,
  user,
} from "@/db/schema";
import { roleNames } from "@/lib/enums";
import { generateUniqueSlug } from "@/lib/slug";
import type { Session } from "../context";
import {
  assertDepartmentScope,
  departmentEditorProcedure,
  router,
} from "../trpc";

/**
 * Resolves the authoritative department for a coordinator session.
 * For `department_editor`, the department is strictly locked to their server session.
 * For `admin`, allows passing a target department slug (or defaults to the first).
 */
async function resolveCoordinatorDepartment(
  session: Session,
  requestedDepartmentSlug?: string,
) {
  if (session.role === "admin") {
    if (requestedDepartmentSlug) {
      const [dept] = await db
        .select()
        .from(department)
        .where(eq(department.slug, requestedDepartmentSlug))
        .limit(1);
      if (dept) return dept;
    }
    const [first] = await db.select().from(department).limit(1);
    if (!first) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No departments exist in the system.",
      });
    }
    return first;
  }

  if (!session.departmentSlug || !session.departmentId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Your coordinator account is not assigned to an academic department.",
    });
  }

  if (
    requestedDepartmentSlug &&
    requestedDepartmentSlug !== session.departmentSlug
  ) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You cannot access records outside your assigned department.",
    });
  }

  const [dept] = await db
    .select()
    .from(department)
    .where(eq(department.id, session.departmentId))
    .limit(1);

  if (!dept) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Assigned department record not found.",
    });
  }

  return dept;
}

/**
 * Limits opportunity reads to what the session may review. Department editors see their own
 * department's listings. Admins see every listing, including faculty-wide ones that have no
 * department, so the condition is left out for them.
 */
function opportunityScope(session: Session) {
  if (session.role === "admin") return undefined;
  if (!session.departmentId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Your coordinator account is not assigned to an academic department.",
    });
  }
  return eq(opportunity.departmentId, session.departmentId);
}

async function resolveDepartmentBySlug(slug: string) {
  const [dept] = await db
    .select()
    .from(department)
    .where(eq(department.slug, slug))
    .limit(1);

  if (!dept) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Department not found.",
    });
  }

  return dept;
}

export const coordinatorRouter = router({
  /**
   * Returns statistics and department identity for the coordinator overview.
   */
  getDepartmentOverview: departmentEditorProcedure
    .input(z.object({ departmentSlug: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const dept = await resolveCoordinatorDepartment(
        ctx.session,
        input?.departmentSlug,
      );

      // Student count
      const [studentsCount] = await db
        .select({ count: count() })
        .from(user)
        .where(eq(user.departmentId, dept.id));

      // Project statistics
      const [totalProjects] = await db
        .select({ count: count() })
        .from(project)
        .where(eq(project.departmentId, dept.id));

      const [pendingProjects] = await db
        .select({ count: count() })
        .from(project)
        .where(
          and(eq(project.departmentId, dept.id), eq(project.status, "submitted")),
        );

      const [approvedProjects] = await db
        .select({ count: count() })
        .from(project)
        .where(
          and(eq(project.departmentId, dept.id), eq(project.status, "approved")),
        );

      const [rejectedProjects] = await db
        .select({ count: count() })
        .from(project)
        .where(
          and(eq(project.departmentId, dept.id), eq(project.status, "rejected")),
        );

      // Opportunities waiting for review, scoped like the opportunity queue
      const [pendingOpportunities] = await db
        .select({ count: count() })
        .from(opportunity)
        .where(
          and(opportunityScope(ctx.session), eq(opportunity.status, "submitted")),
        );

      // Department Notices count
      const [totalNotices] = await db
        .select({ count: count() })
        .from(departmentNotice)
        .where(eq(departmentNotice.departmentId, dept.id));

      const [publishedNotices] = await db
        .select({ count: count() })
        .from(departmentNotice)
        .where(
          and(
            eq(departmentNotice.departmentId, dept.id),
            eq(departmentNotice.published, true),
          ),
        );

      return {
        department: {
          id: dept.id,
          name: dept.name,
          slug: dept.slug,
          shortName: dept.shortName,
          bannerUrl: dept.bannerUrl,
        },
        stats: {
          totalStudents: Number(studentsCount?.count ?? 0),
          totalProjects: Number(totalProjects?.count ?? 0),
          pendingProjects: Number(pendingProjects?.count ?? 0),
          approvedProjects: Number(approvedProjects?.count ?? 0),
          rejectedProjects: Number(rejectedProjects?.count ?? 0),
          pendingOpportunities: Number(pendingOpportunities?.count ?? 0),
          totalNotices: Number(totalNotices?.count ?? 0),
          publishedNotices: Number(publishedNotices?.count ?? 0),
        },
      };
    }),

  /**
   * Returns roster members with overlapping server-side filters (all, assigned,
   * coordinators, unassigned) and an optional department filter for admins.
   */
  getRoster: departmentEditorProcedure
    .input(
      z
        .object({
          departmentSlug: z.string().optional(),
          departmentFilter: z.string().optional(),
          filter: z.enum(["all", "assigned", "coordinators", "unassigned"]).default("all"),
          search: z.string().optional(),
          page: z.number().int().min(1).default(1),
          limit: z.number().int().min(1).max(100).default(50),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const isAdmin = ctx.session.role === "admin";
      const filter = input?.filter ?? "all";
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 50;
      const offset = (page - 1) * limit;

      const requestedDepartment = isAdmin ? input?.departmentFilter : undefined;

      const dept = requestedDepartment
        ? await resolveDepartmentBySlug(requestedDepartment)
        : await resolveCoordinatorDepartment(ctx.session, input?.departmentSlug);
      const filterDepartmentId = requestedDepartment ? dept.id : null;

      // Admins see all platform users, or one department when filtered;
      // coordinators see their department + unassigned users.
      const baseScope = isAdmin
        ? filterDepartmentId
          ? eq(user.departmentId, filterDepartmentId)
          : undefined
        : or(eq(user.departmentId, dept.id), isNull(user.departmentId));

      const assignedCond = filterDepartmentId
        ? eq(user.departmentId, filterDepartmentId)
        : isAdmin
          ? isNotNull(user.departmentId)
          : eq(user.departmentId, dept.id);
      const coordinatorsCond = baseScope
        ? and(baseScope, ne(user.role, "user"))
        : ne(user.role, "user");
      const unassignedCond = filterDepartmentId
        ? and(eq(user.departmentId, filterDepartmentId), isNull(user.departmentId))
        : isNull(user.departmentId);

      const filterCond =
        filter === "assigned"
          ? assignedCond
          : filter === "coordinators"
            ? coordinatorsCond
            : filter === "unassigned"
              ? unassignedCond
              : baseScope;

      const conditions = filterCond ? [filterCond] : [];

      if (input?.search && input.search.trim()) {
        const term = `%${input.search.trim()}%`;
        conditions.push(
          or(
            ilike(user.name, term),
            ilike(user.email, term),
            ilike(user.regNumber, term),
          )!,
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [
        [totalRow],
        [allRow],
        [assignedRow],
        [coordinatorsRow],
        [unassignedRow],
        rows,
      ] = await Promise.all([
        db.select({ count: count() }).from(user).where(whereClause),
        db.select({ count: count() }).from(user).where(baseScope),
        db.select({ count: count() }).from(user).where(assignedCond),
        db.select({ count: count() }).from(user).where(coordinatorsCond),
        db.select({ count: count() }).from(user).where(unassignedCond),
        db
          .select({
            id: user.id,
            name: user.name,
            email: user.email,
            regNumber: user.regNumber,
            role: user.role,
            departmentId: user.departmentId,
            departmentSlug: department.slug,
            departmentName: department.name,
            departmentShortName: department.shortName,
            createdAt: user.createdAt,
          })
          .from(user)
          .leftJoin(department, eq(user.departmentId, department.id))
          .where(whereClause)
          .orderBy(desc(user.createdAt))
          .limit(limit)
          .offset(offset),
      ]);

      const total = Number(totalRow?.count ?? 0);

      return {
        department: {
          name: dept.name,
          slug: dept.slug,
          shortName: dept.shortName,
        },
        students: rows,
        total,
        counts: {
          all: Number(allRow?.count ?? 0),
          assigned: Number(assignedRow?.count ?? 0),
          coordinators: Number(coordinatorsRow?.count ?? 0),
          unassigned: Number(unassignedRow?.count ?? 0),
        },
        page,
        totalPages: Math.ceil(total / limit) || 1,
      };
    }),

  /**
   * Allows admins (and coordinators within their scope) to fill in or update member details.
   */
  updateMember: departmentEditorProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        name: z.string().trim().min(2, "Name must be at least 2 characters.").max(128),
        regNumber: z.string().trim().max(32).nullable().optional(),
        departmentSlug: z.string().nullable().optional(),
        role: z.enum(roleNames).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [target] = await db
        .select({
          id: user.id,
          departmentId: user.departmentId,
        })
        .from(user)
        .where(eq(user.id, input.userId))
        .limit(1);

      if (!target) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });
      }

      const isAdmin = ctx.session.role === "admin";
      if (!isAdmin && target.departmentId && target.departmentId !== ctx.session.departmentId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit members in your assigned department or unassigned users.",
        });
      }

      let resolvedDeptId: string | null | undefined = undefined;
      if (input.departmentSlug !== undefined) {
        if (input.departmentSlug === null) {
          if (!isAdmin) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Only administrators can unassign a user's department.",
            });
          }
          resolvedDeptId = null;
        } else {
          const [dept] = await db
            .select({ id: department.id })
            .from(department)
            .where(eq(department.slug, input.departmentSlug))
            .limit(1);
          if (!dept) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Selected department not found." });
          }
          if (!isAdmin && dept.id !== ctx.session.departmentId) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You can only assign users to your own department.",
            });
          }
          resolvedDeptId = dept.id;
        }
      }

      const updateValues: {
        name: string;
        regNumber?: string | null;
        departmentId?: string | null;
        role?: (typeof roleNames)[number];
      } = {
        name: input.name,
      };

      if (input.regNumber !== undefined) {
        updateValues.regNumber = input.regNumber ? input.regNumber.toUpperCase() : null;
      }

      if (resolvedDeptId !== undefined) {
        updateValues.departmentId = resolvedDeptId;
      }

      if (input.role !== undefined && isAdmin) {
        updateValues.role = input.role;
      }

      const [updated] = await db
        .update(user)
        .set(updateValues)
        .where(eq(user.id, input.userId))
        .returning({
          id: user.id,
          name: user.name,
          regNumber: user.regNumber,
          departmentId: user.departmentId,
          role: user.role,
        });

      return updated;
    }),

  /**
   * Lists project proposals submitted to the coordinator's department.
   */
  listProjects: departmentEditorProcedure
    .input(
      z
        .object({
          departmentSlug: z.string().optional(),
          status: z.enum(["draft", "submitted", "approved", "rejected"]).optional(),
          search: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const dept = await resolveCoordinatorDepartment(
        ctx.session,
        input?.departmentSlug,
      );

      const conditions = [eq(project.departmentId, dept.id)];

      if (input?.status) {
        conditions.push(eq(project.status, input.status));
      }

      if (input?.search && input.search.trim()) {
        const term = `%${input.search.trim()}%`;
        conditions.push(
          or(
            ilike(project.title, term),
            ilike(project.tagline, term),
            ilike(project.teamDisplayName, term),
            ilike(project.courseCode, term),
          )!,
        );
      }

      const rows = await db
        .select({
          id: project.id,
          slug: project.slug,
          title: project.title,
          tagline: project.tagline,
          category: project.category,
          status: project.status,
          courseCode: project.courseCode,
          cohortGroupNumber: project.cohortGroupNumber,
          teamDisplayName: project.teamDisplayName,
          rejectionReason: project.rejectionReason,
          createdAt: project.createdAt,
          author: {
            id: user.id,
            name: user.name,
            regNumber: user.regNumber,
          },
          session: {
            name: schoolSession.name,
          },
        })
        .from(project)
        .leftJoin(user, eq(project.authorUserId, user.id))
        .leftJoin(schoolSession, eq(project.sessionId, schoolSession.id))
        .where(and(...conditions))
        .orderBy(desc(project.createdAt));

      return {
        department: {
          name: dept.name,
          slug: dept.slug,
          shortName: dept.shortName,
        },
        projects: rows,
      };
    }),

  /**
   * Retrieves full details for a specific proposal with department scope check.
   */
  getProject: departmentEditorProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const [proj] = await db
        .select({
          id: project.id,
          slug: project.slug,
          title: project.title,
          tagline: project.tagline,
          descriptionJson: project.descriptionJson,
          category: project.category,
          status: project.status,
          courseCode: project.courseCode,
          cohortGroupNumber: project.cohortGroupNumber,
          teamDisplayName: project.teamDisplayName,
          leadContributors: project.leadContributors,
          rejectionReason: project.rejectionReason,
          bannerUrl: project.bannerUrl,
          galleryUrls: project.galleryUrls,
          repoUrl: project.repoUrl,
          demoUrl: project.demoUrl,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
          departmentId: project.departmentId,
          departmentSlug: department.slug,
          departmentName: department.name,
          author: {
            id: user.id,
            name: user.name,
            email: user.email,
            regNumber: user.regNumber,
          },
          session: {
            name: schoolSession.name,
            slug: schoolSession.slug,
          },
        })
        .from(project)
        .leftJoin(department, eq(project.departmentId, department.id))
        .leftJoin(user, eq(project.authorUserId, user.id))
        .leftJoin(schoolSession, eq(project.sessionId, schoolSession.id))
        .where(eq(project.slug, input.slug))
        .limit(1);

      if (!proj) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project proposal not found.",
        });
      }

      assertDepartmentScope(ctx.session, proj.departmentSlug!);

      return proj;
    }),

  /**
   * Reviews a proposal: approves or rejects with mandatory feedback.
   */
  reviewProject: departmentEditorProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(["approved", "rejected"]),
        rejectionReason: z
          .string()
          .trim()
          .min(5, "Please provide detailed feedback for rejected proposals or change requests.")
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [proj] = await db
        .select({
          id: project.id,
          departmentId: project.departmentId,
          departmentSlug: department.slug,
        })
        .from(project)
        .leftJoin(department, eq(project.departmentId, department.id))
        .where(eq(project.id, input.id))
        .limit(1);

      if (!proj) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project proposal not found.",
        });
      }

      assertDepartmentScope(ctx.session, proj.departmentSlug!);

      if (input.status === "rejected" && !input.rejectionReason) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "A rejection or change request requires detailed feedback.",
        });
      }

      const [updated] = await db
        .update(project)
        .set({
          status: input.status,
          rejectionReason: input.status === "rejected" ? input.rejectionReason : null,
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

  /**
   * Lists opportunity submissions the session may review, newest first.
   */
  listOpportunities: departmentEditorProcedure
    .input(
      z
        .object({
          status: z.enum(["draft", "submitted", "approved", "rejected"]).optional(),
          search: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const conditions = [opportunityScope(ctx.session)];

      if (input?.status) {
        conditions.push(eq(opportunity.status, input.status));
      }

      if (input?.search && input.search.trim()) {
        const term = `%${input.search.trim()}%`;
        conditions.push(or(ilike(opportunity.title, term), ilike(opportunity.orgName, term)));
      }

      const rows = await db
        .select({
          id: opportunity.id,
          slug: opportunity.slug,
          title: opportunity.title,
          orgName: opportunity.orgName,
          type: opportunity.type,
          scopeType: opportunity.scopeType,
          location: opportunity.location,
          deadline: opportunity.deadline,
          status: opportunity.status,
          rejectionReason: opportunity.rejectionReason,
          createdAt: opportunity.createdAt,
          departmentShortName: department.shortName,
          submitter: {
            id: user.id,
            name: user.name,
            regNumber: user.regNumber,
          },
        })
        .from(opportunity)
        .leftJoin(department, eq(opportunity.departmentId, department.id))
        .leftJoin(user, eq(opportunity.submittedByUserId, user.id))
        .where(and(...conditions))
        .orderBy(desc(opportunity.createdAt));

      return { opportunities: rows };
    }),

  /**
   * Retrieves full details for one opportunity submission with a scope check.
   */
  getOpportunity: departmentEditorProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const [opp] = await db
        .select({
          id: opportunity.id,
          slug: opportunity.slug,
          title: opportunity.title,
          orgName: opportunity.orgName,
          orgUrl: opportunity.orgUrl,
          orgLogoUrl: opportunity.orgLogoUrl,
          scopeType: opportunity.scopeType,
          type: opportunity.type,
          location: opportunity.location,
          descriptionJson: opportunity.descriptionJson,
          applyUrl: opportunity.applyUrl,
          hasInternalDetails: opportunity.hasInternalDetails,
          deadline: opportunity.deadline,
          status: opportunity.status,
          rejectionReason: opportunity.rejectionReason,
          createdAt: opportunity.createdAt,
          departmentSlug: department.slug,
          departmentName: department.name,
          submitter: {
            id: user.id,
            name: user.name,
            email: user.email,
            regNumber: user.regNumber,
          },
        })
        .from(opportunity)
        .leftJoin(department, eq(opportunity.departmentId, department.id))
        .leftJoin(user, eq(opportunity.submittedByUserId, user.id))
        .where(eq(opportunity.slug, input.slug))
        .limit(1);

      if (!opp) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Opportunity submission not found.",
        });
      }

      // Faculty-wide listings have no department, so only admins pass this check for them.
      assertDepartmentScope(ctx.session, opp.departmentSlug ?? "");

      return opp;
    }),

  /**
   * Reviews a submitted opportunity: approves it or rejects it with mandatory feedback,
   * then refreshes the public pages that list it.
   */
  reviewOpportunity: departmentEditorProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(["approved", "rejected"]),
        rejectionReason: z
          .string()
          .trim()
          .min(5, "Please provide detailed feedback for rejected opportunities or change requests.")
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [opp] = await db
        .select({
          id: opportunity.id,
          status: opportunity.status,
          departmentSlug: department.slug,
        })
        .from(opportunity)
        .leftJoin(department, eq(opportunity.departmentId, department.id))
        .where(eq(opportunity.id, input.id))
        .limit(1);

      if (!opp) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Opportunity submission not found.",
        });
      }

      assertDepartmentScope(ctx.session, opp.departmentSlug ?? "");

      if (opp.status !== "submitted") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only submitted opportunities can be reviewed.",
        });
      }

      if (input.status === "rejected" && !input.rejectionReason) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "A rejection or change request requires detailed feedback.",
        });
      }

      const [updated] = await db
        .update(opportunity)
        .set({
          status: input.status,
          rejectionReason: input.status === "rejected" ? input.rejectionReason : null,
        })
        .where(eq(opportunity.id, input.id))
        .returning({
          id: opportunity.id,
          slug: opportunity.slug,
          status: opportunity.status,
          title: opportunity.title,
        });

      // The public listing, detail and department hub pages are prerendered, so refresh them.
      revalidatePath("/opportunities");
      if (updated) revalidatePath(`/opportunities/${updated.slug}`);
      if (opp.departmentSlug) revalidatePath(`/departments/${opp.departmentSlug}`);

      return updated;
    }),

  /**
   * Lists departmental notices scoped to coordinator's department.
   */
  listNotices: departmentEditorProcedure
    .input(
      z
        .object({
          departmentSlug: z.string().optional(),
          limit: z.number().int().min(1).max(100).default(50),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const dept = await resolveCoordinatorDepartment(
        ctx.session,
        input?.departmentSlug,
      );

      const rows = await db
        .select({
          id: departmentNotice.id,
          slug: departmentNotice.slug,
          title: departmentNotice.title,
          contentJson: departmentNotice.contentJson,
          isPinned: departmentNotice.isPinned,
          published: departmentNotice.published,
          createdAt: departmentNotice.createdAt,
          updatedAt: departmentNotice.updatedAt,
          authorName: user.name,
        })
        .from(departmentNotice)
        .leftJoin(user, eq(departmentNotice.authorUserId, user.id))
        .where(eq(departmentNotice.departmentId, dept.id))
        .orderBy(desc(departmentNotice.isPinned), desc(departmentNotice.createdAt))
        .limit(input?.limit ?? 50);

      return {
        department: {
          name: dept.name,
          slug: dept.slug,
          shortName: dept.shortName,
        },
        notices: rows,
      };
    }),

  /**
   * Creates a new notice scoped to the coordinator's department.
   */
  createNotice: departmentEditorProcedure
    .input(
      z.object({
        departmentSlug: z.string().optional(),
        title: z.string().trim().min(3, "Title must be at least 3 characters.").max(255),
        contentJson: richTextDoc,
        isPinned: z.boolean().default(false),
        published: z.boolean().default(true),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const dept = await resolveCoordinatorDepartment(
        ctx.session,
        input.departmentSlug,
      );

      const slug = generateUniqueSlug(input.title);

      const [created] = await db
        .insert(departmentNotice)
        .values({
          departmentId: dept.id,
          title: input.title,
          slug,
          contentJson: input.contentJson,
          isPinned: input.isPinned,
          published: input.published,
          authorUserId: ctx.session.userId,
        })
        .returning({
          id: departmentNotice.id,
          slug: departmentNotice.slug,
          title: departmentNotice.title,
        });

      return created;
    }),

  /**
   * Updates an existing notice with department scope check.
   */
  updateNotice: departmentEditorProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().trim().min(3).max(255),
        contentJson: richTextDoc,
        isPinned: z.boolean(),
        published: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [notice] = await db
        .select({
          id: departmentNotice.id,
          departmentId: departmentNotice.departmentId,
          departmentSlug: department.slug,
        })
        .from(departmentNotice)
        .leftJoin(department, eq(departmentNotice.departmentId, department.id))
        .where(eq(departmentNotice.id, input.id))
        .limit(1);

      if (!notice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Department notice not found.",
        });
      }

      assertDepartmentScope(ctx.session, notice.departmentSlug!);

      const [updated] = await db
        .update(departmentNotice)
        .set({
          title: input.title,
          contentJson: input.contentJson,
          isPinned: input.isPinned,
          published: input.published,
        })
        .where(eq(departmentNotice.id, input.id))
        .returning();

      return updated;
    }),

  /**
   * Toggles publication status of a departmental notice.
   */
  publishNotice: departmentEditorProcedure
    .input(z.object({ id: z.string().uuid(), published: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const [notice] = await db
        .select({
          id: departmentNotice.id,
          departmentSlug: department.slug,
        })
        .from(departmentNotice)
        .leftJoin(department, eq(departmentNotice.departmentId, department.id))
        .where(eq(departmentNotice.id, input.id))
        .limit(1);

      if (!notice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Department notice not found.",
        });
      }

      assertDepartmentScope(ctx.session, notice.departmentSlug!);

      const [updated] = await db
        .update(departmentNotice)
        .set({ published: input.published })
        .where(eq(departmentNotice.id, input.id))
        .returning({
          id: departmentNotice.id,
          published: departmentNotice.published,
        });

      return updated;
    }),

  /**
   * Deletes a departmental notice with scope validation.
   */
  deleteNotice: departmentEditorProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [notice] = await db
        .select({
          id: departmentNotice.id,
          departmentSlug: department.slug,
        })
        .from(departmentNotice)
        .leftJoin(department, eq(departmentNotice.departmentId, department.id))
        .where(eq(departmentNotice.id, input.id))
        .limit(1);

      if (!notice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Department notice not found.",
        });
      }

      assertDepartmentScope(ctx.session, notice.departmentSlug!);

      await db
        .delete(departmentNotice)
        .where(eq(departmentNotice.id, input.id));

      return { ok: true as const };
    }),
});
