import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { APP_USER_ID } from "@/lib/config";
import fs from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const { ids } = await req.json();
    if (!ids || !Array.isArray(ids)) return NextResponse.json({ message: "Invalid IDs" }, { status: 400 });

    const images = await prisma.image.findMany({
      where: { id: { in: ids }, userId: APP_USER_ID },
    });

    for (const image of images) {
      const fullPath = path.join(process.cwd(), "public", image.filePath);
      const fullThumbPath = image.thumbnailPath ? path.join(process.cwd(), "public", image.thumbnailPath) : null;
      await fs.unlink(fullPath).catch(() => {});
      if (fullThumbPath) await fs.unlink(fullThumbPath).catch(() => {});
    }

    await prisma.image.deleteMany({
      where: { id: { in: images.map(i => i.id) } },
    });

    return NextResponse.json({ message: "Images deleted" });
  } catch (error) {
    return NextResponse.json({ message: "Error deleting images" }, { status: 500 });
  }
}
