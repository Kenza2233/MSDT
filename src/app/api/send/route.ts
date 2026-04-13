import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { processSendJob } from "@/lib/telegram-sender";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { imageIds, groupIds, caption, delayMs, sendAsAlbum } = await request.json();

    if (!imageIds || imageIds.length === 0 || !groupIds || groupIds.length === 0) {
      return NextResponse.json({ message: "Images and Groups are required" }, { status: 400 });
    }

    const totalSends = imageIds.length * groupIds.length;

    const job = await prisma.sendJob.create({
      data: {
        userId: session.userId,
        totalSends,
        caption,
        delayMs: delayMs || 3000,
        sendAsAlbum: sendAsAlbum ?? true,
        status: "pending",
      },
    });

    const recordsData = [];
    for (const imageId of imageIds) {
      for (const groupId of groupIds) {
        recordsData.push({
          jobId: job.id,
          imageId,
          groupId,
          status: "pending",
        });
      }
    }

    await prisma.sendRecord.createMany({
      data: recordsData,
    });

    // Start background process
    processSendJob(job.id);

    return NextResponse.json({ jobId: job.id, totalSends });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
