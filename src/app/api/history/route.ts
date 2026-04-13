import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || "all";

    const where: any = {
      job: { userId: session.userId }
    };

    if (status !== "all") {
      where.status = status;
    }

    const [records, total] = await Promise.all([
      prisma.sendRecord.findMany({
        where,
        include: {
          image: true,
          group: true,
          job: true,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: (page - 1) * limit
      }),
      prisma.sendRecord.count({ where })
    ]);

    return NextResponse.json({
      records,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    });
  } catch (error) {
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
