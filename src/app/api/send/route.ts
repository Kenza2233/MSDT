import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { processSendJob } from "@/lib/telegram-sender";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    const { imageIds, groupIds, caption, delayMs, sendAsAlbum } = await request.json();
    if (!imageIds?.length || !groupIds?.length) return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    const job = await prisma.sendJob.create({ data: { userId: session.userId, totalSends: imageIds.length * groupIds.length, caption, delayMs: delayMs || 3000, sendAsAlbum: sendAsAlbum ?? true, status: "pending" } });
    const records = [];
    for (const imageId of imageIds) { for (const groupId of groupIds) { records.push({ jobId: job.id, imageId, groupId, status: "pending" }); } }
    await prisma.sendRecord.createMany({ data: records });
    processSendJob(job.id).catch(console.error);
    return NextResponse.json({ jobId: job.id, totalSends: records.length });
  } catch (error) { return NextResponse.json({ message: "Error" }, { status: 500 }); }
}
