import { auth } from "./auth";
import { canPublishContent, hasAnyRole, ADMIN_ROLES, CREATOR_ROLES, SUPERADMIN_ROLES } from "./rbac";
import { jsonForbidden, jsonUnauthorized } from "./api-response";

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) {
    return { session: null, error: jsonUnauthorized() };
  }
  return { session, error: null };
}

export async function requireRole(allowedRoles: string[]) {
  const { session, error } = await requireSession();
  if (error) return { session: null, error };

  const userRoles = session!.user.roles ?? [];
  if (!allowedRoles.some((r) => userRoles.includes(r))) {
    return { session: null, error: jsonForbidden() };
  }

  return { session, error: null };
}

export async function requireCreator() {
  const { session, error } = await requireSession();
  if (error) return { session: null, error };

  if (!canPublishContent(session!.user)) {
    return {
      session: null,
      error: jsonForbidden(),
    };
  }

  return { session, error: null };
}

export async function requireAdmin() {
  return requireRole([...ADMIN_ROLES]);
}

export async function requireSuperAdmin() {
  return requireRole([...SUPERADMIN_ROLES]);
}
