import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { processSendJob } from "@/lib/telegram-sender";

export async function POST(
  request: Request,
  props: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { jobId } = await props.params;

    const job = await prisma.sendJob.findUnique({
        where: { id: jobId },
        include: { sendRecords: true }
    });

    if (!job || job.userId !== session.userId) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }

    // Reset failed records
    await prisma.sendRecord.updateMany({
      where: { jobId, status: "failed" },
      data: { status: "pending", errorMessage: null }
    });

    // Update job status
    await prisma.sendJob.update({
      where: { id: jobId },
      data: { status: "pending", failedSends: 0 }
    });

    // Restart processing
    processSendJob(jobId);

    return NextResponse.json({ message: "Retry started" });
  } catch (error) {
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
