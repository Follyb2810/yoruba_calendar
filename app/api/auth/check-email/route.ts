import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma-client";
import { jsonError } from "@/utils/api-response";

// GET /api/auth/check-email?email=user@example.com
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();

  if (!email) {
    return jsonError("Email is required", 400);
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      password: true,
      accounts: { select: { provider: true } },
    },
  });

  if (!user) {
    return NextResponse.json({
      exists: false,
      hasPassword: false,
      hasGoogle: false,
    });
  }

  return NextResponse.json({
    exists: true,
    hasPassword: !!user.password,
    hasGoogle: user.accounts.some((a) => a.provider === "google"),
  });
}
