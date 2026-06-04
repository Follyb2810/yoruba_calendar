import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma-client";
import bcrypt from "bcrypt";
import { requireSession } from "@/utils/requireRole";
import { jsonError, jsonNotFound } from "@/utils/api-response";

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const { currentPassword, newPassword } = await req.json();

    if (!newPassword || newPassword.length < 8) {
      return jsonError("New password must be at least 8 characters", 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: session!.user.id },
    });

    if (!user) {
      return jsonNotFound("User not found");
    }

    if (user.password) {
      if (!currentPassword) {
        return jsonError("Current password is required", 400);
      }
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return jsonError("Current password is incorrect", 403);
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: "Password updated successfully" });
  } catch {
    return jsonError("Failed to update password", 500);
  }
}
