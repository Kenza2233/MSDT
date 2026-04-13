import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { APP_USER_ID } from "@/lib/config";
import fs from "fs/promises";
import path from "path";

export async function DELETE() {
  try {
    const images = await prisma.image.findMany({
      where: { userId: APP_USER_ID },
    });

    for (const image of images) {
      const fullPath = path.join(process.cwd(), "public", image.filePath);
      const fullThumbPath = image.thumbnailPath ? path.join(process.cwd(), "public", image.thumbnailPath) : null;
      await fs.unlink(fullPath).catch(() => {});
      if (fullThumbPath) await fs.unlink(fullThumbPath).catch(() => {});
    }

    await prisma.image.deleteMany({
      where: { userId: APP_USER_ID },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: "Error clearing images" }, { status: 500 });
  }
}
