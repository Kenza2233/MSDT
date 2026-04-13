import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
export async function GET(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "No session" }, { status: 401 });
  const { jobId } = await params;
  const job = await prisma.sendJob.findUnique({ where: { id: jobId, userId: session.userId }, include: { sendRecords: { include: { image: true, group: true } } } });
  return NextResponse.json({ job });
}
