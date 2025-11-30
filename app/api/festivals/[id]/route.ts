import { prisma } from "@/utils/prisma-client";
import { NextRequest, NextResponse } from "next/server";

// GET /api/festivals/:id
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const festival = await prisma.festival.findUnique({
      where: { id: Number(id) },
      include: { orisa: true },
    });
    if (!festival)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ festival }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch Festival" },
      { status: 500 }
    );
  }
}

// PUT /api/festivals/:id
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await req.json();
  try {
    const festival = await prisma.festival.update({
      where: { id: Number(id) },
      data,
    });
    return NextResponse.json(festival);
  } catch {
    return NextResponse.json(
      { error: "Failed to update Festival" },
      { status: 500 }
    );
  }
}

// DELETE /api/festivals/:id
export async function DELETE(
  req: NextRequest,
  ctx: RouteContext<"/api/festivals/[id]">
) {
  const { id } = await ctx.params;
  // const id = Number(params.id);
  try {
    await prisma.festival.delete({ where: { id: Number(id) } });
    return NextResponse.json({ message: "Festival deleted" });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete Festival" },
      { status: 500 }
    );
  }
}
