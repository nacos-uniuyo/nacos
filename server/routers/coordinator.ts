import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { richTextDoc } from "@/db/json";
import {
  department,
  departmentNotice,
  project,
  schoolSession,
  user,
} from "@/db/schema";
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
          totalNotices: Number(totalNotices?.count ?? 0),
          publishedNotices: Number(publishedNotices?.count ?? 0),
        },
      };
    }),

  /**
   * Returns departmental student roster with search and pagination.
   */
  getRoster: departmentEditorProcedure
    .input(
      z
        .object({
          departmentSlug: z.string().optional(),
          search: z.string().optional(),
          page: z.number().int().min(1).default(1),
          limit: z.number().int().min(1).max(100).default(50),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const dept = await resolveCoordinatorDepartment(
        ctx.session,
        input?.departmentSlug,
      );

      const page = input?.page ?? 1;
      const limit = input?.limit ?? 50;
      const offset = (page - 1) * limit;

      const conditions = [eq(user.departmentId, dept.id)];

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

      const [totalRow] = await db
        .select({ count: count() })
        .from(user)
        .where(and(...conditions));

      const total = Number(totalRow?.count ?? 0);

      const rows = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          regNumber: user.regNumber,
          role: user.role,
          createdAt: user.createdAt,
        })
        .from(user)
        .where(and(...conditions))
        .orderBy(desc(user.createdAt))
        .limit(limit)
        .offset(offset);

      return {
        department: {
          name: dept.name,
          slug: dept.slug,
          shortName: dept.shortName,
        },
        students: rows,
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
      };
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
