import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { startOfDay } from "date-fns";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const [totalImages, activeGroups, sentToday, totalSends] = await Promise.all([
      prisma.image.count({ where: { userId: session.userId } }),
      prisma.group.count({ where: { userId: session.userId, isActive: true } }),
      prisma.sendRecord.count({
        where: {
          job: { userId: session.userId },
          status: "sent",
          sentAt: { gte: startOfDay(new Date()) }
        }
      }),
      prisma.sendRecord.count({
        where: {
          job: { userId: session.userId },
          status: "sent"
        }
      }),
    ]);

    return NextResponse.json({
      totalImages,
      activeGroups,
      sentToday,
      totalSends,
    });
  } catch (error) {
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
