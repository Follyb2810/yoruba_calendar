import { NextRequest, NextResponse } from "next/server";
import { requireCreator } from "@/utils/requireRole";
import { jsonError } from "@/utils/api-response";
import { uploadToCloudinary } from "@/utils/cloudinary";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// POST /api/upload — multipart form: file, folder (optional)
export async function POST(req: NextRequest) {
  const { error } = await requireCreator();
  if (error) return error;

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return jsonError("No file provided", 400);
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return jsonError("Only JPEG, PNG, WebP, and GIF images are allowed", 400);
    }

    if (file.size > MAX_SIZE) {
      return jsonError("Image must be under 5MB", 400);
    }

    const folder =
      (formData.get("folder") as string)?.trim() || "yoruba_calendar/uploads";

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadToCloudinary(buffer, { folder });

    return NextResponse.json({
      url: result.url,
      publicId: result.publicId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return jsonError(message, 500);
  }
}
