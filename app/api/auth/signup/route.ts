import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma-client";
import bcrypt from "bcrypt";
import { SignupSchema } from "@/helpers/zod/signup-schema";
import { jsonError } from "@/utils/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SignupSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid input";
      return jsonError(message, 400);
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { accounts: { select: { provider: true } } },
    });

    if (existingUser) {
      // Already has password — must sign in
      if (existingUser.password) {
        return jsonError(
          "An account with this email already exists. Please sign in.",
          409
        );
      }

      // Google-only account — add a password so they can also sign in with email
      const hashed = await bcrypt.hash(password, 10);
      const updated = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          password: hashed,
          name: name || existingUser.name,
        },
        select: { id: true, email: true, name: true },
      });

      return NextResponse.json(
        {
          ...updated,
          message:
            "Password added to your Google account. You can now sign in with email or Google.",
          linked: true,
        },
        { status: 200 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashed,
        roles: { create: [{ role: { connect: { name: "USER" } } }] },
      },
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Signup failed";
    return jsonError(message, 500);
  }
}
