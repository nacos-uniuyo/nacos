import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import type { Context, Session } from "./context";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

function requireSession(session: Session | null): Session {
  if (!session) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Sign in to continue." });
  }
  return session;
}

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  return next({ ctx: { ...ctx, session: requireSession(ctx.session) } });
});

/**
 * Admins pass this guard as well as department editors. Department scoping is
 * checked inside each procedure, where the target department is known.
 */
export const departmentEditorProcedure = t.procedure.use(({ ctx, next }) => {
  const session = requireSession(ctx.session);
  if (session.role !== "department_editor" && session.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Department editors only." });
  }
  return next({ ctx: { ...ctx, session } });
});

export const adminProcedure = t.procedure.use(({ ctx, next }) => {
  const session = requireSession(ctx.session);
  if (session.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Administrators only." });
  }
  return next({ ctx: { ...ctx, session } });
});

/**
 * Admins act anywhere. A department editor only acts inside the department the
 * session resolves to, so a scoped console cannot touch another department's
 * records by guessing a slug or an id.
 */
export function assertDepartmentScope(session: Session, departmentSlug: string) {
  if (session.role === "admin") return;
  if (session.role !== "department_editor" || session.departmentSlug !== departmentSlug) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This action is outside the department assigned to you.",
    });
  }
}
