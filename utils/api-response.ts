import { NextResponse } from "next/server";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function jsonUnauthorized() {
  return jsonError("Unauthorized", 401);
}

export function jsonForbidden() {
  return jsonError("Forbidden", 403);
}

export function jsonNotFound(message = "Not found") {
  return jsonError(message, 404);
}

export function jsonServerError(message = "Internal server error") {
  return jsonError(message, 500);
}
