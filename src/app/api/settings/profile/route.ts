import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "No session" }, { status: 401 });
  const { name, email } = await request.json();
  const user = await prisma.user.update({ where: { id: session.userId }, data: { name, email } });
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
}
