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
