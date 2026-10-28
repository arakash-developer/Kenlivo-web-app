import { NextResponse } from "next/server";
import { verifyAccessToken, type JwtPayload } from "./jwt";

export function ok<T>(data: T, message = "Success", meta?: object) {
  return NextResponse.json({ success: true, message, data, ...(meta ? { meta } : {}) });
}

export function created<T>(data: T, message = "Created") {
  return NextResponse.json({ success: true, message, data }, { status: 201 });
}

export function err(message: string, status = 400) {
  return NextResponse.json({ success: false, message, data: null }, { status });
}

export function unauthorized(message = "Unauthorized") {
  return err(message, 401);
}

export function forbidden(message = "Forbidden") {
  return err(message, 403);
}

export function notFound(message = "Not found") {
  return err(message, 404);
}

/** Extract and verify Bearer token from Authorization header. */
export async function authenticate(req: Request): Promise<JwtPayload | null> {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  return verifyAccessToken(token);
}

/** Require a valid access token; returns user or a 401 response. */
export async function requireAuth(
  req: Request
): Promise<{ user: JwtPayload } | NextResponse> {
  const user = await authenticate(req);
  if (!user) return unauthorized();
  return { user };
}

/** Require admin or super_admin role. */
export async function requireAdmin(
  req: Request
): Promise<{ user: JwtPayload } | NextResponse> {
  const result = await requireAuth(req);
  if (result instanceof NextResponse) return result;
  if (result.user.role !== "admin" && result.user.role !== "super_admin") {
    return forbidden("Admin access required");
  }
  return result;
}
