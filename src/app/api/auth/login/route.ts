import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { signJWT } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    const token = await signJWT({ userId: user.id, email: user.email });
    const response = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, telegramId: user.telegramId, botToken: user.botToken } });
    response.cookies.set("auth_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 7 * 24 * 60 * 60 });
    return response;
  } catch (error) { return NextResponse.json({ message: "Internal error" }, { status: 500 }); }
}
