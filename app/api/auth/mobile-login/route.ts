import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "@/utils/prisma-client";
// import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user)
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const isValid = await bcrypt.compare(password, user.password!);
  if (!isValid)
    return NextResponse.json({ error: "Invalid login" }, { status: 401 });

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );

  return NextResponse.json({ token, user });
}
