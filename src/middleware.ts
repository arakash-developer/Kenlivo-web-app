import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge route protection for the web-app.
 *
 * The API (kenlivo-server) sets an httpOnly `refreshToken` JWT cookie on login.
 * We use that cookie at the edge as a lightweight UX gate:
 *   - no cookie                -> redirect to /login
 *   - /admin without admin role -> redirect to /login
 *
 * This mirrors the backend's `authenticate` + `authorize` middleware, but it is
 * NOT the source of truth: the API still verifies the signed token on every
 * request. We only decode (not verify) the payload here to avoid shipping the
 * JWT secret / a verification lib to the edge runtime.
 */

const REFRESH_COOKIE = "refreshToken";
// Better-auth's default session cookie (used by the navbar / profile flow).
const BETTER_AUTH_COOKIES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
];

type Role = "customer" | "admin";

/** Decode a JWT payload without verifying its signature (edge-safe). */
function decodeRole(token: string): Role | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const data = JSON.parse(json) as { role?: Role };
    return data.role ?? null;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(REFRESH_COOKIE)?.value;
  const hasBetterAuth = BETTER_AUTH_COOKIES.some((c) => req.cookies.has(c));

  // Admin area requires the backend JWT with the admin role.
  if (pathname.startsWith("/admin")) {
    if (!token || decodeRole(token) !== "admin") {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Authenticated account pages (e.g. /profile): accept either auth system.
  if (!token && !hasBetterAuth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Protect the admin dashboard and authenticated account pages.
  matcher: ["/admin/:path*", "/profile/:path*"],
};
