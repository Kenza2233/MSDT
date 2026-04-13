import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { APP_USER_ID } from "@/lib/config";
import { processSendJob } from "@/lib/telegram-sender";

export async function POST(req: Request) {
  try {
    const { imageIds, groupIds, sendAsAlbum, albumSize, delayMs, caption } = await req.json();

    if (!imageIds?.length || !groupIds?.length) {
      return NextResponse.json({ message: "Images and Groups are required" }, { status: 400 });
    }

    const totalSends = imageIds.length * groupIds.length;

    const job = await prisma.sendJob.create({
      data: {
        userId: APP_USER_ID,
        totalSends,
        sendAsAlbum: !!sendAsAlbum,
        albumSize: albumSize || 10,
        delayMs: delayMs || 1000,
        caption: caption || null,
        status: "pending",
      },
    });

    const records = [];
    for (const imageId of imageIds) {
      for (const groupId of groupIds) {
        records.push({
          jobId: job.id,
          imageId,
          groupId,
          status: "pending",
        });
      }
    }

    await prisma.sendRecord.createMany({ data: records });

    // Trigger background process
    processSendJob(job.id);

    return NextResponse.json(job);
  } catch (error) {
    console.error("Send error:", error);
    return NextResponse.json({ message: "Error starting send job" }, { status: 500 });
  }
}
