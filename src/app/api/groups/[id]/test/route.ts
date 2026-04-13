import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import TelegramBot from "node-telegram-bot-api";

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const params = await props.params;
    const group = await prisma.group.findUnique({
      where: { id: params.id },
    });

    if (!group || group.userId !== session.userId) {
      return NextResponse.json({ message: "Group not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user?.botToken) {
      return NextResponse.json({ message: "Bot token not configured" }, { status: 400 });
    }

    const bot = new TelegramBot(user.botToken);

    try {
      await bot.sendMessage(group.chatId, "🔄 *Connection Test*\n\nYour bot is successfully connected to this group!", { parse_mode: 'Markdown' });

      const chat = await bot.getChat(group.chatId);
      const memberCount = await bot.getChatMemberCount(group.chatId);

      await prisma.group.update({
        where: { id: group.id },
        data: {
          testStatus: "success",
          lastTestedAt: new Date(),
          memberCount: memberCount
        }
      });

      return NextResponse.json({ success: true, memberCount });
    } catch (err: any) {
      await prisma.group.update({
        where: { id: group.id },
        data: {
          testStatus: "failed",
          lastTestedAt: new Date(),
        }
      });
      return NextResponse.json({ message: err.message }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
