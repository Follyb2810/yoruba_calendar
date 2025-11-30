import { prisma } from "@/utils/prisma-client";
import { NextRequest, NextResponse } from "next/server";

// GET /api/orisha?skip=0&limit=10&search=Olokun
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const skip = Number(searchParams.get("skip") || 0);
  const limit = Number(searchParams.get("limit") || 10);
  const search = searchParams.get("search") || "";

  try {
    const orisha = await prisma.orisa.findMany({
      where: {
        name: { contains: search },
      },
      include: { festivals: true },
      skip,
      take: limit,
    });
    return NextResponse.json(orisha);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch Orisas" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const orisa = await prisma.orisa.create({
      data: { name },
    });

    return NextResponse.json(orisa);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
