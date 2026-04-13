import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { APP_USER_ID, THUMBNAIL_SIZE } from "@/lib/config";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ message: "No files uploaded" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", APP_USER_ID.toString());
    await fs.mkdir(uploadDir, { recursive: true });

    const results = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = path.extname(file.name);
      const fileName = `${uuidv4()}${ext}`;
      const filePath = `/uploads/${APP_USER_ID}/${fileName}`;
      const thumbFileName = `thumb-${fileName}`;
      const thumbPath = `/uploads/${APP_USER_ID}/${thumbFileName}`;

      const fullFilePath = path.join(process.cwd(), "public", filePath);
      const fullThumbPath = path.join(process.cwd(), "public", thumbPath);

      // Save original
      await fs.writeFile(fullFilePath, buffer);

      // Generate thumbnail
      let width = null, height = null;
      try {
        const metadata = await sharp(buffer).metadata();
        width = metadata.width;
        height = metadata.height;

        await sharp(buffer)
          .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, { fit: "cover" })
          .jpeg({ quality: 80 })
          .toFile(fullThumbPath);
      } catch (err) {
        console.error("Sharp error:", err);
      }

      const image = await prisma.image.create({
        data: {
          userId: APP_USER_ID,
          fileName: file.name,
          filePath,
          thumbnailPath: thumbPath,
          fileSize: file.size,
          mimeType: file.type,
          width,
          height,
        },
      });

      results.push(image);
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}
