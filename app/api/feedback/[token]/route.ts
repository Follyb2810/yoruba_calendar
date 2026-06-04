import { NextResponse } from "next/server";
import { feedbackService } from "@/module/Feedback/feedback.service";
import { feedbackSchema } from "@/helpers/zod/payout.schema";
import { jsonError, jsonNotFound } from "@/utils/api-response";

type RouteContext = { params: Promise<{ token: string }> };

// GET /api/feedback/[token]
export async function GET(_req: Request, context: RouteContext) {
  const { token } = await context.params;
  const preview = await feedbackService.getByToken(token);

  if (!preview) return jsonNotFound("Feedback link not found");

  return NextResponse.json({ preview });
}

// POST /api/feedback/[token]
export async function POST(req: Request, context: RouteContext) {
  const { token } = await context.params;

  try {
    const body = await req.json();
    const parsed = feedbackSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid feedback", 400);
    }

    await feedbackService.submit(token, parsed.data);
    return NextResponse.json({ message: "Thank you for your feedback!" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to submit feedback";
    return jsonError(message, 400);
  }
}
