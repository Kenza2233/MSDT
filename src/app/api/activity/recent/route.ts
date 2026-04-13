import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { APP_USER_ID } from "@/lib/config";

export async function GET() {
  try {
    const recentRecords = await prisma.sendRecord.findMany({
      where: { job: { userId: APP_USER_ID } },
      include: {
        image: true,
        group: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json(recentRecords);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching recent activity" }, { status: 500 });
  }
}
