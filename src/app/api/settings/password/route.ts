import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "No session" }, { status: 401 });
  const { currentPassword, newPassword } = await request.json();
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || !(await bcrypt.compare(currentPassword, user.password))) return NextResponse.json({ message: "Invalid current password" }, { status: 400 });
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: session.userId }, data: { password: hashedPassword } });
  return NextResponse.json({ message: "Updated" });
}
