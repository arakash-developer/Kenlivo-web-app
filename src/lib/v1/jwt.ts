import { SignJWT, jwtVerify } from "jose";

const accessSecret = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET ?? "kenlivo-access-secret-change-me"
);
const refreshSecret = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET ?? "kenlivo-refresh-secret-change-me"
);

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

export async function signAccessToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(accessSecret);
}

export async function signRefreshToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(refreshSecret);
}

export async function verifyAccessToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, accessSecret);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, refreshSecret);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}
