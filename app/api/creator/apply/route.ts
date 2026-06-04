import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma-client";
import { requireSession } from "@/utils/requireRole";
import { isCreator } from "@/utils/rbac";
import { jsonError } from "@/utils/api-response";

// GET /api/creator/apply — check creator status
export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;

  return NextResponse.json({
    isCreator: isCreator(session!.user),
    roles: session!.user.roles ?? [],
  });
}

// POST /api/creator/apply — grant CREATOR role (self-service)
export async function POST() {
  const { session, error } = await requireSession();
  if (error) return error;

  if (isCreator(session!.user)) {
    return NextResponse.json({
      message: "You already have creator access",
      isCreator: true,
    });
  }

  try {
    const creatorRole = await prisma.role.findUnique({
      where: { name: "CREATOR" },
    });

    if (!creatorRole) {
      return jsonError("Creator role is not configured. Run the database seed.", 500);
    }

    await prisma.userRole.create({
      data: {
        userId: session!.user.id,
        roleId: creatorRole.id,
      },
    });

    return NextResponse.json({
      message: "Welcome! You can now publish events and books.",
      isCreator: true,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to apply";
    return jsonError(message, 500);
  }
}
