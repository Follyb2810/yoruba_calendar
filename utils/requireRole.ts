import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";

export async function requireRole(allowedRoles: string[]) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  const userRoles = (session.user as any).roles;
  if (!allowedRoles.some((r) => userRoles.includes(r)))
    throw new Error("Forbidden");
  return session;
}
