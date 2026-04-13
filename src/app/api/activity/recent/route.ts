import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "No session" }, { status: 401 });
  const activity = await prisma.sendRecord.findMany({ where: { job: { userId: session.userId } }, take: 10, include: { image: true, group: true } });
  return NextResponse.json({ activity });
}
