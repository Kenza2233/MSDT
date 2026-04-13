import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "No session" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const images = await prisma.image.findMany({ where: { userId: session.userId, originalName: { contains: searchParams.get("search") || "", mode: "insensitive" } }, take: 20 });
  return NextResponse.json({ images, pagination: { total: images.length, pages: 1 } });
}
