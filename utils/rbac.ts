export function hasRole(token: any, role: string) {
  if (!token) return false;
  const roles = token.roles || [];
  return roles.includes(role);
}

export function hasAnyRole(token: any, rolesToCheck: string[]) {
  if (!token) return false;
  const roles = token.roles || [];
  return rolesToCheck.some((r) => roles.includes(r));
}
