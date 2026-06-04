import { z } from "zod";
import { prisma } from "@/utils/prisma-client";
import { requireAdmin } from "@/utils/requireRole";
import { jsonError } from "@/utils/api-response";
import { NextResponse } from "next/server";
import { grantRoleSchema } from "@/helpers/zod/admin.schema";

const GRANTABLE_BY_ADMIN = ["CREATOR", "MODERATOR"] as const;
const GRANTABLE_BY_SUPERADMIN = [
  "CREATOR",
  "MODERATOR",
  "ADMIN",
  "SUPERADMIN",
] as const;

// GET /api/admin/users — list users (admin+)
export async function GET() {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      roles: { include: { role: { select: { name: true } } } },
    },
  });

  return NextResponse.json({
    users: users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      roles: user.roles.map((r) => r.role.name),
    })),
    currentUserId: session!.user.id,
  });
}

// POST /api/admin/users — grant role by email (admin+)
export async function POST(req: Request) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const parsed = grantRoleSchema.safeParse(body);

  if (!email) return jsonError("Email is required", 400);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid role", 400);
  }

  const { role: roleName } = parsed.data;
  const isSuperAdmin = session!.user.roles.includes("SUPERADMIN");

  if (!isSuperAdmin && !GRANTABLE_BY_ADMIN.includes(roleName as typeof GRANTABLE_BY_ADMIN[number])) {
    return jsonError("Only the platform owner can grant that role", 403);
  }

  if (
    isSuperAdmin &&
    !GRANTABLE_BY_SUPERADMIN.includes(roleName as typeof GRANTABLE_BY_SUPERADMIN[number])
  ) {
    return jsonError("Invalid role", 400);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return jsonError("User not found — they must sign up first", 404);

  const role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) return jsonError("Role is not configured. Run the database seed.", 500);

  const existing = await prisma.userRole.findFirst({
    where: { userId: user.id, roleId: role.id },
  });

  if (existing) {
    return NextResponse.json({
      message: `${user.email} already has the ${roleName} role`,
      user: { id: user.id, email: user.email, roles: await loadRoles(user.id) },
    });
  }

  await prisma.userRole.create({
    data: { userId: user.id, roleId: role.id },
  });

  return NextResponse.json({
    message: `Granted ${roleName} to ${user.email}`,
    user: { id: user.id, email: user.email, roles: await loadRoles(user.id) },
  });
}

async function loadRoles(userId: string): Promise<string[]> {
  const rows = await prisma.userRole.findMany({
    where: { userId },
    include: { role: true },
  });
  return rows.map((r) => r.role.name);
}
