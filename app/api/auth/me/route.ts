import { auth } from "@/utils/auth";
import { prisma } from "@/utils/prisma-client";
// import { getServerSession } from "next-auth/next";

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      password: true, // for internal check
      roles: { select: { role: { select: { name: true } } } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    hasPassword: !!user.password,
    roles: user.roles.map((ur) => ur.role.name),
  });
}
