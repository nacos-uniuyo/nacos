import { eq } from "drizzle-orm";
import { db } from "@/db";
import { department } from "@/db/schema";
import { auth } from "@/lib/auth";

export type Session = {
  userId: string;
  role: "user" | "department_editor" | "admin";
  /** Set for department editors, null for global roles. */
  departmentSlug: string | null;
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

  const { id, departmentId } = authSession.user;
  const role = authSession.user.role ?? "user";

  if (!departmentId) {
    return { session: { userId: id, role, departmentSlug: null } };
  }

  const [row] = await db
    .select({ slug: department.slug })
    .from(department)
    .where(eq(department.id, departmentId))
    .limit(1);

  return { session: { userId: id, role, departmentSlug: row?.slug ?? null } };
}
