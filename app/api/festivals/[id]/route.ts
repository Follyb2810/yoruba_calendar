import { NextRequest, NextResponse } from "next/server";
import { FestivalStatus } from "@/generated/prisma";
import { auth } from "@/utils/auth";
import { festivalService } from "@/module/Festival/festival.service";
import { requireCreator } from "@/utils/requireRole";
import { canManageResource } from "@/utils/rbac";
import {
  jsonError,
  jsonNotFound,
  jsonServerError,
} from "@/utils/api-response";
import { serializeFestival } from "@/utils/serializeFestival";
import { updateFestivalSchema } from "@/helpers/zod/festival-api.schema";

// GET /api/festivals/:id — public for published events
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const festival = await festivalService.getFestivalById(Number(id));
    const session = await auth();

    if (festival.status !== FestivalStatus.PUBLISHED) {
      const canViewDraft =
        session?.user &&
        canManageResource(
          { id: session.user.id, roles: session.user.roles ?? [] },
          festival.userId
        );

      if (!canViewDraft) {
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
  const { session, error } = await requireCreator();
  if (error) return error;

  const { id } = await params;
  const user = { id: session!.user.id, roles: session!.user.roles ?? [] };

  try {
    const body = await req.json();

    if (body.action === "publish") {
      const festival = await festivalService.publishFestival(Number(id), user);
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
      user
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
  const { session, error } = await requireCreator();
  if (error) return error;

  const { id } = await params;
  const user = { id: session!.user.id, roles: session!.user.roles ?? [] };

  try {
    await festivalService.deleteFestival(Number(id), user);
    return NextResponse.json({ message: "Festival deleted" });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to delete festival";
    return jsonError(message, 400);
  }
}
