import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { APP_USER_ID } from "@/lib/config";

export async function PUT(req: Request) {
  try {
    const { botToken } = await req.json();
    await prisma.user.update({
      where: { id: APP_USER_ID },
      data: { botToken },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: "Error saving bot token" }, { status: 500 });
  }
}
