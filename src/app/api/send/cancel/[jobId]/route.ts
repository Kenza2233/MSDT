import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  props: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { jobId } = await props.params;

    const job = await prisma.sendJob.findUnique({ where: { id: jobId } });
    if (!job || job.userId !== session.userId) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }

    await prisma.sendJob.update({
      where: { id: jobId },
      data: { status: "cancelled" }
    });

    return NextResponse.json({ message: "Job cancelled" });
  } catch (error) {
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
