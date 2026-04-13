import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { APP_USER_ID } from "@/lib/config";
import { processSendJob } from "@/lib/telegram-sender";

export async function POST(req: Request, props: { params: Promise<{ jobId: string }> }) {
  try {
    const params = await props.params;
    const jobId = parseInt(params.jobId);

    const job = await prisma.sendJob.findUnique({
      where: { id: jobId, userId: APP_USER_ID },
      include: { records: true },
    });

    if (!job) return NextResponse.json({ message: "Job not found" }, { status: 404 });

    // Reset failed records
    await prisma.sendRecord.updateMany({
      where: { jobId, status: "failed" },
      data: { status: "pending", errorMessage: null },
    });

    await prisma.sendJob.update({
      where: { id: jobId },
      data: { status: "pending", failedSends: 0 },
    });

    processSendJob(jobId);

    return NextResponse.json({ message: "Retrying failed records" });
  } catch (error) {
    return NextResponse.json({ message: "Error retrying failed records" }, { status: 500 });
  }
}
