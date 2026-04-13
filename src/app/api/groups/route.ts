import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { APP_USER_ID } from "@/lib/config";

export async function GET() {
  try {
    const groups = await prisma.group.findMany({
      where: { userId: APP_USER_ID },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(groups);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching groups" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { title, chatId, type } = await req.json();
    const group = await prisma.group.create({
      data: {
        userId: APP_USER_ID,
        title,
        chatId: chatId.toString(),
        type: type || "group",
      },
    });
    return NextResponse.json(group);
  } catch (error) {
    return NextResponse.json({ message: "Error creating group" }, { status: 500 });
  }
}
