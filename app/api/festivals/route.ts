import { NextRequest, NextResponse } from "next/server";
import { createFestivalSchema } from "@/helpers/zod/festival-api.schema";
import { festivalService } from "@/module/Festival/festival.service";
import { requireSession } from "@/utils/requireRole";
import {
  jsonError,
  jsonServerError,
  jsonUnauthorized,
} from "@/utils/api-response";
import { serializeFestival } from "@/utils/serializeFestival";

// GET /api/festivals?search=&filter=all|published|drafts|ended&mine=true
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const filter = (searchParams.get("filter") || "all") as
    | "all"
    | "published"
    | "drafts"
    | "ended";
  const mine = searchParams.get("mine") === "true";

  try {
    if (mine) {
      const { session, error } = await requireSession();
      if (error) return error;

      const festivals = await festivalService.getUserFestivals(
        session!.user.id,
        filter
      );
      return NextResponse.json({
        festivals: festivals.map(serializeFestival),
      });
    }

    const festivals = await festivalService.getPublicFestivals(search);
    return NextResponse.json({
      festivals: festivals.map(serializeFestival),
    });
  } catch {
    return jsonServerError("Failed to fetch festivals");
  }
}

// POST /api/festivals
export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = createFestivalSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid input";
      return jsonError(message, 400);
    }

    const festival = await festivalService.createFestival(
      parsed.data,
      session!.user.id
    );

    return NextResponse.json(
      { festival: serializeFestival(festival) },
      { status: 201 }
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to create festival";
    return jsonError(message, 400);
  }
}
