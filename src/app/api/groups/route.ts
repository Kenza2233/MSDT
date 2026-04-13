import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "No session" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const groups = await prisma.group.findMany({ where: { userId: session.userId, name: { contains: searchParams.get("search") || "", mode: "insensitive" } } });
  return NextResponse.json({ groups });
}
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "No session" }, { status: 401 });
  const { name, chatId, type } = await request.json();
  const group = await prisma.group.create({ data: { userId: session.userId, name, chatId: chatId.toString(), type: type || "group" } });
  return NextResponse.json({ group }, { status: 201 });
}
