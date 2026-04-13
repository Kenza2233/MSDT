import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "No session" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;
  const records = await prisma.sendRecord.findMany({
    where: { job: { userId: session.userId } },
    skip, take: limit, orderBy: { createdAt: "desc" },
    include: { image: { select: { thumbnailPath: true, originalName: true } }, group: { select: { name: true, type: true } } }
  });
  const total = await prisma.sendRecord.count({ where: { job: { userId: session.userId } } });
  return NextResponse.json({ records, pagination: { total, pages: Math.ceil(total / limit), page, limit } });
}
