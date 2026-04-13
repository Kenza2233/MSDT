import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "No session" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  return NextResponse.json({ connected: !!user?.botToken });
}
