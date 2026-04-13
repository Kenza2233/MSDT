import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const thumbDir = path.join(uploadDir, "thumbs");
    await mkdir(thumbDir, { recursive: true });
    const uploaded = [];
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `${uuidv4()}${path.extname(file.name)}`;
      const filePath = `/uploads/${filename}`;
      const thumbPath = `/uploads/thumbs/thumb-${filename}`;
      await writeFile(path.join(process.cwd(), "public", filePath), buffer);
      await sharp(buffer).resize(300).toFile(path.join(process.cwd(), "public", thumbPath));
      const dbImg = await prisma.image.create({ data: { userId: session.userId, filename, originalName: file.name, filePath, thumbnailPath: thumbPath, fileSize: file.size, mimeType: file.type } });
      uploaded.push(dbImg);
    }
    return NextResponse.json({ uploaded });
  } catch (e) { return NextResponse.json({ message: "Error" }, { status: 500 }); }
}
