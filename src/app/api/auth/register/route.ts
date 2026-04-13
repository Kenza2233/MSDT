import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { signJWT } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    if (!name || !email || !password) return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return NextResponse.json({ message: "Email registered" }, { status: 400 });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, password: hashedPassword } });
    const token = await signJWT({ userId: user.id, email: user.email });
    const response = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } }, { status: 201 });
    response.cookies.set("auth_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 7 * 24 * 60 * 60 });
    return response;
  } catch (error) { return NextResponse.json({ message: "Internal error" }, { status: 500 }); }
}
