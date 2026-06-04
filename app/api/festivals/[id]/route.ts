import { NextRequest, NextResponse } from "next/server";
import { festivalService } from "@/module/Festival/festival.service";
import { requireSession } from "@/utils/requireRole";
import {
  jsonError,
  jsonNotFound,
  jsonServerError,
} from "@/utils/api-response";
import { serializeFestival } from "@/utils/serializeFestival";
import { updateFestivalSchema } from "@/helpers/zod/festival-api.schema";
import { FestivalStatus } from "@/generated/prisma";

// GET /api/festivals/:id
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const festival = await festivalService.getFestivalById(Number(id));
    const { session } = await requireSession();

    if (festival.status !== FestivalStatus.PUBLISHED) {
      if (!session || festival.userId !== session.user.id) {
        return jsonNotFound("Festival not found");
      }
    }

    return NextResponse.json({ festival: serializeFestival(festival) });
  } catch {
    return jsonNotFound("Festival not found");
  }
}

// PATCH /api/festivals/:id — update or publish
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { id } = await params;

  try {
    const body = await req.json();

    if (body.action === "publish") {
      const festival = await festivalService.publishFestival(
        Number(id),
        session!.user.id
      );
      return NextResponse.json({ festival: serializeFestival(festival) });
    }

    const parsed = updateFestivalSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid input";
      return jsonError(message, 400);
    }

    const festival = await festivalService.updateFestival(
      Number(id),
      parsed.data as Parameters<typeof festivalService.updateFestival>[1],
      session!.user.id
    );
    return NextResponse.json({ festival: serializeFestival(festival) });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to update festival";
    return jsonError(message, 400);
  }
}

// DELETE /api/festivals/:id
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { id } = await params;

  try {
    await festivalService.deleteFestival(Number(id), session!.user.id);
    return NextResponse.json({ message: "Festival deleted" });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to delete festival";
    return jsonError(message, 400);
  }
}
