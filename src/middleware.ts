import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge route protection.
 *
 * The /api/v1/auth/login endpoint sets an httpOnly `refreshToken` JWT cookie.
 * We decode (not verify) it at the edge as a lightweight UX gate.
 * The API still verifies the signed token on every request — this is NOT the source of truth.
 */

const REFRESH_COOKIE = "refreshToken";
const BETTER_AUTH_COOKIES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
];

type Role = "customer" | "admin" | "super_admin";

function decodeJwtPayload(token: string): { role?: Role; sub?: string } | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(REFRESH_COOKIE)?.value;
  const hasBetterAuth = BETTER_AUTH_COOKIES.some((c) => req.cookies.has(c));

  // Admin area requires the backend JWT with admin/super_admin role.
  if (pathname.startsWith("/admin")) {
    const payload = token ? decodeJwtPayload(token) : null;
    const isAdmin = payload?.role === "admin" || payload?.role === "super_admin";
    if (!isAdmin) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Authenticated pages (e.g. /profile): accept either auth system.
  if (pathname.startsWith("/profile")) {
    if (!token && !hasBetterAuth) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*"],
};
