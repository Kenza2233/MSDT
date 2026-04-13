import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import TelegramBot from "node-telegram-bot-api";
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const user = await prisma.user.findUnique({ where: { id: session?.userId } });
  if (!user?.botToken) return NextResponse.json({ message: "Bot not configured" }, { status: 400 });
  const { id } = await params;
  const group = await prisma.group.findUnique({ where: { id, userId: user.id } });
  if (!group) return NextResponse.json({ message: "Not found" }, { status: 404 });
  const bot = new TelegramBot(user.botToken, { polling: false });
  try {
    await bot.sendMessage(group.chatId, "✅ Test connection");
    const count = await bot.getChatMemberCount(group.chatId).catch(() => null);
    await prisma.group.update({ where: { id }, data: { lastTestedAt: new Date(), testStatus: "success", memberCount: count } });
    return NextResponse.json({ message: "Success", memberCount: count });
  } catch (e: any) {
    await prisma.group.update({ where: { id }, data: { lastTestedAt: new Date(), testStatus: "failed" } });
    return NextResponse.json({ message: e.message }, { status: 400 });
  }
}
