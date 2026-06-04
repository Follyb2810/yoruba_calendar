import { NextRequest, NextResponse } from "next/server";
import { OrisaService } from "@/module/Orisa/orisa.service";
import { requireRole, requireSession } from "@/utils/requireRole";
import { jsonError, jsonServerError } from "@/utils/api-response";

const orisaService = new OrisaService();

// GET /api/orisha?skip=0&limit=50&search=Olokun
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = (searchParams.get("search") || "").toLowerCase();

  try {
    let orisas = await orisaService.getAllOrisas();

    if (search) {
      orisas = orisas.filter((o) => o.name.toLowerCase().includes(search));
    }

    return NextResponse.json(
      orisas.map((o) => ({ id: o.id, name: o.name }))
    );
  } catch {
    return jsonServerError("Failed to fetch Orisas");
  }
}

// POST /api/orisha — admin/moderator only
export async function POST(req: NextRequest) {
  const { session, error } = await requireRole([
    "ADMIN",
    "MODERATOR",
    "SUPERADMIN",
  ]);
  if (error) return error;

  try {
    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== "string") {
      return jsonError("Name is required", 400);
    }

    const orisa = await orisaService.createOrisa({
      name: name.trim(),
      userId: session!.user.id,
    });

    return NextResponse.json(orisa, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to create Orisa";
    return jsonError(message, 400);
  }
}
