import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { APP_USER_ID } from "@/lib/config";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const job = await prisma.sendJob.findUnique({
      where: { id: parseInt(params.id), userId: APP_USER_ID },
      include: {
        records: {
          include: {
            group: true,
            image: true,
          },
        },
      },
    });

    if (!job) return NextResponse.json({ message: "Job not found" }, { status: 404 });

    return NextResponse.json(job);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching job details" }, { status: 500 });
  }
}
