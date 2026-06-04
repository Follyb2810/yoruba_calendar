import { prisma } from "@/utils/prisma-client";

const PLATFORM_OWNER_ROLES = [
  "USER",
  "CREATOR",
  "MODERATOR",
  "ADMIN",
  "SUPERADMIN",
] as const;

function parseOwnerEmails(): string[] {
  const raw =
    process.env.OWNER_EMAIL ??
    process.env.SUPERADMIN_EMAIL ??
    process.env.ADMIN_EMAIL ??
    "";

  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isPlatformOwnerEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return parseOwnerEmails().includes(normalized);
}

/** Grant full platform roles to the configured owner email(s). Idempotent. */
export async function ensurePlatformOwnerRoles(
  userId: string,
  email: string | null | undefined
): Promise<void> {
  if (!isPlatformOwnerEmail(email)) return;

  for (const name of PLATFORM_OWNER_ROLES) {
    const role = await prisma.role.findUnique({ where: { name } });
    if (!role) continue;

    const existing = await prisma.userRole.findFirst({
      where: { userId, roleId: role.id },
    });

    if (!existing) {
      await prisma.userRole.create({
        data: { userId, roleId: role.id },
      });
    }
  }
}

export async function ensureDefaultUserRole(userId: string): Promise<void> {
  const userRole = await prisma.role.findUnique({ where: { name: "USER" } });
  if (!userRole) return;

  const existing = await prisma.userRole.findFirst({
    where: { userId, roleId: userRole.id },
  });

  if (!existing) {
    await prisma.userRole.create({
      data: { userId, roleId: userRole.id },
    });
  }
}
