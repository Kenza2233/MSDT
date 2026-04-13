import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { APP_USER_ID } from "@/lib/config";
import TelegramBot from "node-telegram-bot-api";

export async function GET() {
  try {
    const user = await prisma.user.findUnique({ where: { id: APP_USER_ID } });

    if (!user?.botToken) {
      return NextResponse.json({ message: "Bot token not configured" }, { status: 400 });
    }

    const bot = new TelegramBot(user.botToken);
    const updates = await bot.getUpdates({ limit: 100, timeout: 0 });

    const chats = new Map();

    updates.forEach(update => {
      const message = update.message || update.channel_post;
      if (message && message.chat) {
        chats.set(message.chat.id.toString(), {
          chatId: message.chat.id.toString(),
          name: message.chat.title || message.chat.username || "Unknown",
          type: message.chat.type
        });
      }
    });

    return NextResponse.json({ chats: Array.from(chats.values()) });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
