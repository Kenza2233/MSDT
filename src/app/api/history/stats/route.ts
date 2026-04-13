import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { APP_USER_ID } from "@/lib/config";

export async function GET() {
  try {
    const totalSent = await prisma.sendRecord.count({
      where: { job: { userId: APP_USER_ID }, status: "sent" },
    });

    const sentToday = await prisma.sendRecord.count({
      where: {
        job: { userId: APP_USER_ID },
        status: "sent",
        sentAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    const totalRecords = await prisma.sendRecord.count({
      where: { job: { userId: APP_USER_ID } },
    });

    const successRate = totalRecords > 0 ? (totalSent / totalRecords) * 100 : 100;

    return NextResponse.json({
      totalSent,
      sentToday,
      successRate: Math.round(successRate),
    });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching history stats" }, { status: 500 });
  }
}
