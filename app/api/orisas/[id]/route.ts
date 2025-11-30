import { prisma } from "@/utils/prisma-client";
import { NextRequest, NextResponse } from "next/server";

// GET /api/orisas/:id
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ctx: RouteContext<'/users/[id]'>
  // const { id } = await ctx.params
  const { id } = await params;
  const idx = Number(id);
  try {
    const orisa = await prisma.orisa.findUnique({
      where: { id: idx },
      include: { festivals: true },
    });
    if (!orisa)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(orisa);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch Orisa" },
      { status: 500 }
    );
  }
}

// PUT /api/orisas/:id
export async function PUT(
  req: NextRequest,
  ctx: RouteContext<"/api/orisas/[id]">
) {
  const { id } = await ctx.params;
  const data = await req.json();
  try {
    const orisa = await prisma.orisa.update({
      where: { id: Number(id) },
      data,
    });
    return NextResponse.json(orisa);
  } catch {
    return NextResponse.json(
      { error: "Failed to update Orisa" },
      { status: 500 }
    );
  }
}

// DELETE /api/orisas/:id
export async function DELETE(
  req: NextRequest,
  ctx: RouteContext<"/api/orisas/[id]">
) {
  const { id } = await ctx.params;
  try {
    await prisma.orisa.delete({ where: { id: Number(id) } });
    return NextResponse.json({ message: "Orisa deleted" });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete Orisa" },
      { status: 500 }
    );
  }
}
