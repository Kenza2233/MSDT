import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { APP_USER_ID } from "@/lib/config";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const take = parseInt(searchParams.get("take") || "20");
    const skip = (page - 1) * take;

    const where: any = {
      userId: APP_USER_ID,
      fileName: { contains: search, mode: "insensitive" },
    };

    if (status !== "all") {
      where.status = status;
    }

    const orderBy: any = {};
    if (sort === "newest") orderBy.createdAt = "desc";
    else if (sort === "oldest") orderBy.createdAt = "asc";
    else if (sort === "largest") orderBy.fileSize = "desc";
    else if (sort === "name") orderBy.fileName = "asc";

    const [images, total] = await Promise.all([
      prisma.image.findMany({
        where,
        orderBy,
        take,
        skip,
      }),
      prisma.image.count({ where }),
    ]);

    return NextResponse.json({ images, total, page, take });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching images" }, { status: 500 });
  }
}
