import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const groups = await prisma.group.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ groups });
  } catch (error) {
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { name, chatId, type } = await request.json();

    if (!name || !chatId) {
      return NextResponse.json({ message: "Name and Chat ID are required" }, { status: 400 });
    }

    const group = await prisma.group.create({
      data: {
        userId: session.userId,
        name,
        chatId: chatId.toString(),
        type: type || "group",
      },
    });

    return NextResponse.json({ group });
  } catch (error) {
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
