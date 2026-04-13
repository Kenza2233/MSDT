import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "No session" }, { status: 401 });
  const [totalSent, sentToday] = await Promise.all([prisma.sendRecord.count({ where: { job: { userId: session.userId }, status: "sent" } }), prisma.sendRecord.count({ where: { job: { userId: session.userId }, status: "sent", sentAt: { gte: new Date(new Date().setHours(0,0,0,0)) } } })]);
  return NextResponse.json({ totalSent, sentToday, failedRecent: 0, successRate: 100 });
}
