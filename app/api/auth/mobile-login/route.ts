import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "@/utils/prisma-client";
import { jsonError } from "@/utils/api-response";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return jsonError("Email and password are required", 400);
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } },
    });

    if (!user || !user.password) {
      return jsonError("Invalid credentials", 401);
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return jsonError("Invalid credentials", 401);
    }

    const secret = process.env.JWT_SECRET ?? process.env.NEXTAUTH_SECRET;
    if (!secret) {
      return jsonError("Server configuration error", 500);
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        roles: user.roles.map((r) => r.role.name),
      },
      secret,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles.map((r) => r.role.name),
      },
    });
  } catch {
    return jsonError("Login failed", 500);
  }
}
