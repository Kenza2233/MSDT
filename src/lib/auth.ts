import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "your-32-character-minimum-secret-key-fallback";

export interface JWTPayload {
  userId: string;
  email: string;
}

export async function signJWT(payload: JWTPayload): Promise<string> {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) return null;
  return verifyJWT(token);
}
