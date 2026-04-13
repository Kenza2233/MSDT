import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "No session" }, { status: 401 });
  const [totalImages, totalGroups] = await Promise.all([prisma.image.count({ where: { userId: session.userId } }), prisma.group.count({ where: { userId: session.userId, isActive: true } })]);
  return NextResponse.json({ totalImages, totalGroups, sentToday: 0, successRate: 100 });
}
