import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/v1/db";
import { signAccessToken, signRefreshToken } from "@/lib/v1/jwt";
import { ok, created, err } from "@/lib/v1/response";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return err("Invalid JSON");

  const { name, email, password, phone } = body as {
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
  };

  if (!name || !email || !password) return err("name, email and password are required");
  if (password.length < 6) return err("Password must be at least 6 characters");

  const db = await getDb();
  const customers = db.collection("customers");

  const existing = await customers.findOne({ email: email.toLowerCase() });
  if (existing) return err("Email already registered", 409);

  const passwordHash = await bcrypt.hash(password, 12);
  const now = new Date();

  const { insertedId } = await customers.insertOne({
    name,
    email: email.toLowerCase(),
    passwordHash,
    phone: phone ?? null,
    role: "customer",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });

  const payload = { sub: insertedId.toString(), email: email.toLowerCase(), role: "customer" };
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(payload),
    signRefreshToken(payload),
  ]);

  const user = { id: insertedId.toString(), name, email: email.toLowerCase(), role: "customer", phone: phone ?? null };

  const res = created({ user, accessToken }, "Registered successfully");
  res.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}
