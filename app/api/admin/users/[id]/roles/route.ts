import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma-client";
import { requireSuperAdmin } from "@/utils/requireRole";
import { jsonError } from "@/utils/api-response";
import { grantRoleSchema } from "@/helpers/zod/admin.schema";

type RouteContext = { params: Promise<{ id: string }> };

// POST /api/admin/users/[id]/roles — grant role by user id (superadmin)
export async function POST(req: Request, context: RouteContext) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const { id: userId } = await context.params;
  const body = await req.json();
  const parsed = grantRoleSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid role", 400);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return jsonError("User not found", 404);

  const role = await prisma.role.findUnique({
    where: { name: parsed.data.role },
  });
  if (!role) return jsonError("Role is not configured", 500);

  const existing = await prisma.userRole.findFirst({
    where: { userId, roleId: role.id },
  });

  if (existing) {
    return NextResponse.json({
      message: `User already has ${parsed.data.role}`,
    });
  }

  await prisma.userRole.create({
    data: { userId, roleId: role.id },
  });

  const roles = await prisma.userRole.findMany({
    where: { userId },
    include: { role: true },
  });

  return NextResponse.json({
    message: `Granted ${parsed.data.role}`,
    roles: roles.map((r) => r.role.name),
  });
}

// DELETE /api/admin/users/[id]/roles?role=CREATOR — revoke role (superadmin)
export async function DELETE(req: NextRequest, context: RouteContext) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const { id: userId } = await context.params;
  const roleName = req.nextUrl.searchParams.get("role");
  const parsed = grantRoleSchema.safeParse({ role: roleName });

  if (!parsed.success) {
    return jsonError("Valid role query param required", 400);
  }

  if (parsed.data.role === "SUPERADMIN") {
    return jsonError("Cannot revoke SUPERADMIN via API", 400);
  }

  const role = await prisma.role.findUnique({
    where: { name: parsed.data.role },
  });
  if (!role) return jsonError("Role not found", 404);

  await prisma.userRole.deleteMany({
    where: { userId, roleId: role.id },
  });

  return NextResponse.json({ message: `Removed ${parsed.data.role}` });
}
