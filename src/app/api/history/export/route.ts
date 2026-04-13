import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "No session" }, { status: 401 });
  return new NextResponse("Date,Image,Group,Type,Status,Error,TelegramMsgId", { headers: { "Content-Type": "text/csv", "Content-Disposition": 'attachment; filename="history.csv"' } });
}
