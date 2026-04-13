import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  props: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const params = await props.params;
    const { jobId } = params;

    const job = await prisma.sendJob.findUnique({
      where: { id: jobId },
      include: {
        sendRecords: {
          include: {
            group: true,
            image: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!job || job.userId !== session.userId) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ job });
  } catch (error) {
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
