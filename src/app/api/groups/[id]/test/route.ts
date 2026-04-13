import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { APP_USER_ID } from "@/lib/config";
import TelegramBot from "node-telegram-bot-api";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const user = await prisma.user.findUnique({ where: { id: APP_USER_ID } });
    const group = await prisma.group.findUnique({ where: { id: parseInt(params.id) } });

    if (!user?.botToken) return NextResponse.json({ message: "Bot token not configured" }, { status: 400 });
    if (!group) return NextResponse.json({ message: "Group not found" }, { status: 404 });

    const bot = new TelegramBot(user.botToken);
    try {
      await bot.sendMessage(group.chatId, "🔄 Connection Test: TelegramBulkSender is active!");
      await prisma.group.update({
        where: { id: group.id },
        data: { testStatus: "success", testMessage: "Test successful" },
      });
      return NextResponse.json({ success: true });
    } catch (err: any) {
      await prisma.group.update({
        where: { id: group.id },
        data: { testStatus: "failed", testMessage: err.message },
      });
      return NextResponse.json({ success: false, message: err.message }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ message: "Error testing connection" }, { status: 500 });
  }
}
