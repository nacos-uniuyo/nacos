import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  deansMessage,
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
import {
  adminProcedure,
  assertDepartmentScope,
  departmentEditorProcedure,
  publicProcedure,
  router,
} from "./trpc";

/**
 * Phase 1 contracts. Every procedure reads the fixtures in mocks/portal.ts and
 * validates the result against its contract, so data that drifts from the page
 * shape fails at the boundary instead of rendering something wrong. Phase 3
 * swaps the bodies for Drizzle queries and leaves the signatures alone.
 */

function bySlug<T extends { slug: string }>(
  items: T[],
  slug: string,
  contract: z.ZodType<T>,
) {
  const found = items.find((item) => item.slug === slug);
  return found ? contract.parse(found) : null;
}

const departmentRouter = router({
  list: publicProcedure.query(() => z.array(departmentSummary).parse(departments)),
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ input }) => bySlug(departments, input.slug, departmentSummary)),
});

const sessionRouter = router({
  list: publicProcedure.query(() => z.array(schoolSessionSummary).parse(schoolSessions)),
  current: publicProcedure.query(() => {
    const found = schoolSessions.find((s) => s.isCurrent);
    return found ? schoolSessionSummary.parse(found) : null;
  }),
});

const rosterRouter = router({
  bySession: publicProcedure
    .input(z.object({ sessionSlug: z.string() }))
    .query(({ input }) => {
      const people = roster.filter((p) => p.sessionSlug === input.sessionSlug);
      return z.array(personSummary).parse(people);
    }),
  /** Curated in the admin console later; the flag is on the record, not a guess. */
  featured: publicProcedure.query(() => {
    const people = roster.filter((p) => p.isFeaturedHomepage);
    return z.array(personSummary).parse(people);
  }),
});

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
    .query(({ input }) => {
      const filtered = projects.filter((p) => {
        if (input?.departmentSlug && p.departmentSlug !== input.departmentSlug) return false;
        if (input?.category && p.category !== input.category) return false;
        return true;
      });
      return z.array(projectSummary).parse(filtered);
    }),
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ input }) => bySlug(projects, input.slug, projectSummary)),
  /** Scoped to the editor's own department; admins pass. */
  review: departmentEditorProcedure
    .input(
      z.object({
        slug: z.string(),
        status: z.enum(["approved", "rejected"]),
        rejectionReason: z.string().min(1).optional(),
      }),
    )
    .mutation(({ ctx, input }) => {
      const found = projects.find((p) => p.slug === input.slug);
      if (!found) throw new TRPCError({ code: "NOT_FOUND", message: "No such project." });
      assertDepartmentScope(ctx.session, found.departmentSlug);
      if (input.status === "rejected" && !input.rejectionReason) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "A rejection needs a reason." });
      }
      // Phase 3 writes the status through Drizzle.
      return { slug: found.slug, status: input.status };
    }),
});

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
    .query(({ input }) => {
      const filtered = opportunities.filter((o) => {
        if (input?.type && o.type !== input.type) return false;
        if (input?.departmentSlug && o.departmentSlug !== input.departmentSlug) return false;
        return true;
      });
      return z.array(opportunitySummary).parse(filtered);
    }),
});

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
  deansMessage: publicProcedure.query(() => deansMessage),
});

/** Mutation contracts exist now so the admin UI can be built against them. */
const adminRouter = router({
  updateDeansMessage: adminProcedure
    .input(
      z.object({
        heading: z.string().min(1),
        body: z.string().min(1),
        authorName: z.string().min(1),
        authorTitle: z.string().min(1),
      }),
    )
    .mutation(() => {
      // Phase 3 writes to platform_setting through Drizzle.
      return { ok: true as const };
    }),
});

export const appRouter = router({
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
