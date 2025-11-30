import { prisma } from "@/utils/prisma-client";
import { NextRequest, NextResponse } from "next/server";

// GET /api/festivals?skip=0&limit=10&search=Sango
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const skip = Number(searchParams.get("skip") || 0);
  const limit = Number(searchParams.get("limit") || 10);
  const search = searchParams.get("search") || "";

  try {
    const festivals = await prisma.festival.findMany({
      where: {
        title: { contains: search },
      },
      include: { orisa: true },
      skip,
      take: limit,
    });
    return NextResponse.json({ festivals });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch Festivals" },
      { status: 500 }
    );
  }
}

// POST /api/festivals
export async function POST(req: NextRequest) {
  const data = await req.json();
  try {
    const festival = await prisma.festival.create({ data });
    return NextResponse.json({ festival }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create Festival" },
      { status: 500 }
    );
  }
}
