import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { APP_USER_ID } from "@/lib/config";

export async function GET() {
  try {
    const [totalImages, totalGroups, sentTodayCount, totalSentCount, totalFailedCount] = await Promise.all([
      prisma.image.count({ where: { userId: APP_USER_ID } }),
      prisma.group.count({ where: { userId: APP_USER_ID, isActive: true } }),
      prisma.sendRecord.count({
        where: {
          job: { userId: APP_USER_ID },
          status: "sent",
          sentAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      prisma.sendRecord.count({ where: { job: { userId: APP_USER_ID }, status: "sent" } }),
      prisma.sendRecord.count({ where: { job: { userId: APP_USER_ID }, status: "failed" } }),
    ]);

    const totalAttempts = totalSentCount + totalFailedCount;
    const successRate = totalAttempts > 0 ? (totalSentCount / totalAttempts) * 100 : 100;

    return NextResponse.json({
      totalImages,
      totalGroups,
      sentToday: sentTodayCount,
      successRate: Math.round(successRate),
    });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching stats" }, { status: 500 });
  }
}
