import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const [totalSent, sentToday, failedRecent, totalHistory] = await Promise.all([
      prisma.sendRecord.count({
        where: { job: { userId: session.userId }, status: "sent" }
      }),
      prisma.sendRecord.count({
        where: {
          job: { userId: session.userId },
          status: "sent",
          sentAt: { gte: new Date(new Date().setHours(0,0,0,0)) }
        }
      }),
      prisma.sendRecord.count({
        where: {
          job: { userId: session.userId },
          status: "failed",
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      }),
      prisma.sendRecord.count({
        where: { job: { userId: session.userId } }
      })
    ]);

    const successRate = totalHistory > 0 ? Math.round((totalSent / totalHistory) * 100) : 100;

    return NextResponse.json({
      totalSent,
      sentToday,
      failedRecent,
      successRate
    });
  } catch (error) {
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
