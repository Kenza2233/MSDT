import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { APP_USER_ID } from "@/lib/config";
import fs from "fs/promises";
import path from "path";

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const image = await prisma.image.findUnique({
      where: { id: parseInt(params.id), userId: APP_USER_ID },
    });

    if (!image) return NextResponse.json({ message: "Image not found" }, { status: 404 });

    // Delete files
    const fullPath = path.join(process.cwd(), "public", image.filePath);
    const fullThumbPath = image.thumbnailPath ? path.join(process.cwd(), "public", image.thumbnailPath) : null;

    await fs.unlink(fullPath).catch(() => {});
    if (fullThumbPath) await fs.unlink(fullThumbPath).catch(() => {});

    await prisma.image.delete({
      where: { id: image.id },
    });

    return NextResponse.json({ message: "Image deleted" });
  } catch (error) {
    return NextResponse.json({ message: "Error deleting image" }, { status: 500 });
  }
}
