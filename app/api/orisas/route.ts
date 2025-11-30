import { prisma } from "@/utils/prisma-client";
import { NextRequest, NextResponse } from "next/server";

// GET /api/orisas?skip=0&limit=10&search=Olokun
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const skip = Number(searchParams.get("skip") || 0);
  const limit = Number(searchParams.get("limit") || 10);
  const search = searchParams.get("search") || "";

  try {
    const orisas = await prisma.orisa.findMany({
      where: {
        name: { contains: search },
      },
      include: { festivals: true },
      skip,
      take: limit,
    });
    return NextResponse.json(orisas);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch Orisas" },
      { status: 500 }
    );
  }
}

// POST /api/orisas
export async function POST(req: NextRequest) {
  const data = await req.json();
  try {
    const orisa = await prisma.orisa.create({ data });
    return NextResponse.json(orisa);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create Orisa" },
      { status: 500 }
    );
  }
}
