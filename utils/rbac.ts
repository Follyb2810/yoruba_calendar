export const CREATOR_ROLES = ["CREATOR", "MODERATOR", "ADMIN", "SUPERADMIN"] as const;
export const ADMIN_ROLES = ["ADMIN", "SUPERADMIN"] as const;
export const SUPERADMIN_ROLES = ["SUPERADMIN"] as const;

export function hasRole(
  user: { roles: string[] } | undefined,
  role: string
): boolean {
  if (!user) return false;
  return Array.isArray(user.roles) && user.roles.includes(role);
}

export function hasAnyRole(
  user: { roles: string[] } | undefined,
  rolesToCheck: string[]
): boolean {
  if (!user) return false;
  const userRoles = Array.isArray(user.roles) ? user.roles : [];
  return rolesToCheck.some((r) => userRoles.includes(r));
}

export function isCreator(user: { roles: string[] } | undefined): boolean {
  return hasAnyRole(user, [...CREATOR_ROLES]);
}

export function isAdmin(user: { roles: string[] } | undefined): boolean {
  return hasAnyRole(user, [...ADMIN_ROLES]);
}

export function isSuperAdmin(user: { roles: string[] } | undefined): boolean {
  return hasAnyRole(user, [...SUPERADMIN_ROLES]);
}

/** Can publish events, books, and upload media */
export function canPublishContent(user: { roles: string[] } | undefined): boolean {
  return isCreator(user);
}

export function canManageResource(
  user: { id: string; roles: string[] } | undefined,
  ownerId: string
): boolean {
  if (!user) return false;
  if (user.id === ownerId) return true;
  return isAdmin(user);
}
