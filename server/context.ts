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
 * Better Auth replaces this body in Phase 3. Until then no request carries a
 * session, so protected procedures refuse everyone and the public portal runs
 * entirely on mock fixtures.
 */
export function createContext(): Context {
  return { session: null };
}
