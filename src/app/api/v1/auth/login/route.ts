import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/v1/db";
import { signAccessToken, signRefreshToken } from "@/lib/v1/jwt";
import { ok, err, forbidden } from "@/lib/v1/response";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return err("Invalid JSON");

  const { email, password } = body as { email?: string; password?: string };
  if (!email || !password) return err("email and password are required");

  const db = await getDb();
  const customer = await db.collection("customers").findOne({ email: email.toLowerCase() });

  if (!customer || !(await bcrypt.compare(password, customer.passwordHash))) {
    return err("Invalid email or password", 401);
  }

  if (!customer.isActive) return err("Account is disabled", 403);

  // This is a customer portal — admins must use the admin panel.
  if (customer.role === "admin" || customer.role === "super_admin") {
    return forbidden("Admin accounts cannot sign in to the customer portal");
  }

  const payload = {
    sub: customer._id.toString(),
    email: customer.email,
    role: customer.role,
  };

  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(payload),
    signRefreshToken(payload),
  ]);

  const user = {
    id: customer._id.toString(),
    name: customer.name,
    email: customer.email,
    role: customer.role,
    phone: customer.phone ?? null,
  };

  const res = ok({ user, accessToken }, "Logged in successfully");
  res.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}
