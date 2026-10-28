import { NextRequest } from "next/server";
import { verifyRefreshToken, signAccessToken } from "@/lib/v1/jwt";
import { ok, err } from "@/lib/v1/response";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("refreshToken")?.value;
  if (!token) return err("No refresh token", 401);

  const payload = await verifyRefreshToken(token);
  if (!payload) return err("Invalid or expired refresh token", 401);

  const accessToken = await signAccessToken({
    sub: payload.sub,
    email: payload.email,
    role: payload.role,
  });

  return ok({ accessToken });
}
