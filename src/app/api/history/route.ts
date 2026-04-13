import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { APP_USER_ID } from "@/lib/config";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const take = parseInt(searchParams.get("take") || "10");
    const skip = (page - 1) * take;

    const [jobs, total] = await Promise.all([
      prisma.sendJob.findMany({
        where: { userId: APP_USER_ID },
        orderBy: { createdAt: "desc" },
        take,
        skip,
      }),
      prisma.sendJob.count({ where: { userId: APP_USER_ID } }),
    ]);

    return NextResponse.json({ jobs, total, page, take });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching history" }, { status: 500 });
  }
}
