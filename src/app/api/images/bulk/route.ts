import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json({ message: "Invalid IDs" }, { status: 400 });
    }

    const images = await prisma.image.findMany({
      where: {
        id: { in: ids },
        userId: session.userId,
      },
    });

    for (const image of images) {
      try {
        const fullPath = path.join(process.cwd(), "public", image.filePath);
        const thumbPath = image.thumbnailPath ? path.join(process.cwd(), "public", image.thumbnailPath) : null;

        await fs.unlink(fullPath).catch(() => {});
        if (thumbPath) await fs.unlink(thumbPath).catch(() => {});
      } catch (err) {
        console.error("File deletion error:", err);
      }
    }

    await prisma.sendRecord.deleteMany({
      where: { imageId: { in: images.map(i => i.id) } }
    });

    await prisma.image.deleteMany({
      where: {
        id: { in: images.map(i => i.id) },
      },
    });

    return NextResponse.json({ message: "Images deleted" });
  } catch (error) {
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
