import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { APP_USER_ID } from "@/lib/config";

export async function POST(req: Request, props: { params: Promise<{ jobId: string }> }) {
  try {
    const params = await props.params;
    const job = await prisma.sendJob.findUnique({
      where: { id: parseInt(params.jobId), userId: APP_USER_ID },
    });

    if (!job) return NextResponse.json({ message: "Job not found" }, { status: 404 });
    if (job.status === "completed" || job.status === "failed") {
      return NextResponse.json({ message: "Job already finished" }, { status: 400 });
    }

    await prisma.sendJob.update({
      where: { id: job.id },
      data: { status: "cancelled" },
    });

    return NextResponse.json({ message: "Job cancellation requested" });
  } catch (error) {
    return NextResponse.json({ message: "Error cancelling job" }, { status: 500 });
  }
}
