import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const sort = searchParams.get("sort") || "newest";
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");

    const where: any = {
      userId: session.userId,
      filename: { contains: search, mode: 'insensitive' }
    };

    if (status !== "all") {
      where.status = status;
    }

    const orderBy: any = {};
    if (sort === "newest") orderBy.createdAt = "desc";
    else if (sort === "oldest") orderBy.createdAt = "asc";
    else if (sort === "largest") orderBy.fileSize = "desc";
    else if (sort === "name") orderBy.filename = "asc";

    const [images, total] = await Promise.all([
      prisma.image.findMany({
        where,
        orderBy,
        take: limit,
        skip: (page - 1) * limit
      }),
      prisma.image.count({ where })
    ]);

    return NextResponse.json({
      images,
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
