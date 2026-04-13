import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs/promises";
import sharp from "sharp";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ message: "No files uploaded" }, { status: 400 });
    }

    const uploaded = [];

    // Ensure directories exist
    const baseDir = path.join(process.cwd(), "public", "uploads", session.userId);
    const thumbDir = path.join(baseDir, "thumbs");
    await fs.mkdir(thumbDir, { recursive: true });

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = path.extname(file.name);
      const filename = `${uuidv4()}${ext}`;
      const filePathRelative = `/uploads/${session.userId}/${filename}`;
      const thumbPathRelative = `/uploads/${session.userId}/thumbs/thumb-${filename}`;

      const filePathAbsolute = path.join(process.cwd(), "public", filePathRelative);
      const thumbPathAbsolute = path.join(process.cwd(), "public", thumbPathRelative);

      // Save original
      await fs.writeFile(filePathAbsolute, buffer);

      // Generate thumbnail
      let metadata;
      try {
        const sharpImg = sharp(buffer);
        metadata = await sharpImg.metadata();
        await sharpImg
          .resize(300, 300, { fit: "cover" })
          .toFile(thumbPathAbsolute);
      } catch (err) {
        console.error("Sharp error:", err);
      }

      const image = await prisma.image.create({
        data: {
          userId: session.userId,
          filename: filename,
          originalName: file.name,
          filePath: filePathRelative,
          thumbnailPath: thumbPathRelative,
          fileSize: file.size,
          mimeType: file.type,
          width: metadata?.width,
          height: metadata?.height,
        }
      });
      uploaded.push(image);
    }

    return NextResponse.json({ uploaded });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ message: error.message || "Internal error" }, { status: 500 });
  }
}
