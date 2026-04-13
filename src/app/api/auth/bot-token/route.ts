import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import TelegramBot from "node-telegram-bot-api";
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "No session" }, { status: 401 });
  const { botToken } = await request.json();
  const bot = new TelegramBot(botToken, { polling: false });
  try {
    const me = await bot.getMe();
    await prisma.user.update({ where: { id: session.userId }, data: { botToken, telegramId: me.id.toString() } });
    return NextResponse.json({ bot: { id: me.id, username: me.username } });
  } catch (e) { return NextResponse.json({ message: "Invalid bot token" }, { status: 400 }); }
}
