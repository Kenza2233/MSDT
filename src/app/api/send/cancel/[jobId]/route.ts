import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
export async function POST(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "No session" }, { status: 401 });
  const { jobId } = await params;
  await prisma.sendJob.update({ where: { id: jobId, userId: session.userId }, data: { status: "cancelled" } });
  return NextResponse.json({ message: "Cancelled" });
}
