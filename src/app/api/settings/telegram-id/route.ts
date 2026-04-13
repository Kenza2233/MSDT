import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { APP_USER_ID } from "@/lib/config";

export async function PUT(req: Request) {
  try {
    const { telegramId } = await req.json();
    await prisma.user.update({
      where: { id: APP_USER_ID },
      data: { telegramId: telegramId?.toString() },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: "Error saving telegram ID" }, { status: 500 });
  }
}
