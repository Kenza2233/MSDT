import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-jwt-key";
export interface JWTPayload { userId: string; email: string; }
export async function signJWT(payload: JWTPayload): Promise<string> { return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" }); }
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try { return jwt.verify(token, JWT_SECRET) as JWTPayload; } catch (e) { return null; }
}
export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  return token ? verifyJWT(token) : null;
}
