import { eq } from "drizzle-orm";
import { db } from "@/db";
import { department } from "@/db/schema";
import { auth } from "@/lib/auth";

export type Session = {
  userId: string;
  role: "user" | "department_editor" | "admin";
  /** Set for department editors, null for global roles. */
  departmentSlug: string | null;
  departmentId: string | null;
  email: string;
  name: string;
  regNumber: string | null;
};

export type Context = {
  session: Session | null;
};

/**
 * tRPC runs per request, so this resolves the Better Auth session from the
 * incoming cookie. A department editor carries an id on their user record; the
 * slug is looked up here so procedures can scope by the same value the public
 * URLs use.
 */
export async function createContext(reqHeaders: Headers): Promise<Context> {
  const authSession = await auth.api.getSession({ headers: reqHeaders });
  if (!authSession) return { session: null };

  const { id, departmentId, email, name, regNumber } = authSession.user;
  const role = (authSession.user.role ?? "user") as Session["role"];

  if (!departmentId) {
    return {
      session: {
        userId: id,
        role,
        departmentSlug: null,
        departmentId: null,
        email,
        name,
        regNumber: regNumber ?? null,
      },
    };
  }

  const [row] = await db
    .select({ slug: department.slug })
    .from(department)
    .where(eq(department.id, departmentId))
    .limit(1);

  return {
    session: {
      userId: id,
      role,
      departmentSlug: row?.slug ?? null,
      departmentId,
      email,
      name,
      regNumber: regNumber ?? null,
    },
  };
}
