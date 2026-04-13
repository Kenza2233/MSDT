import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { APP_USER_ID } from "@/lib/config";
import TelegramBot from "node-telegram-bot-api";

export async function GET() {
  try {
    const user = await prisma.user.findUnique({
      where: { id: APP_USER_ID },
    });

    if (!user?.botToken) {
      return NextResponse.json({ connected: false });
    }

    const bot = new TelegramBot(user.botToken);
    try {
      const me = await bot.getMe();
      return NextResponse.json({
        connected: true,
        username: me.username,
        firstName: me.first_name,
      });
    } catch (err) {
      return NextResponse.json({ connected: false, error: "Invalid token" });
    }
  } catch (error) {
    return NextResponse.json({ connected: false }, { status: 500 });
  }
}
