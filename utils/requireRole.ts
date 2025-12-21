
import { auth } from "./auth";

export async function requireRole(allowedRoles: string[]) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  const userRoles = (session.user as any).roles;
  if (!allowedRoles.some((r) => userRoles.includes(r)))
    throw new Error("Forbidden");
  return session;
}
