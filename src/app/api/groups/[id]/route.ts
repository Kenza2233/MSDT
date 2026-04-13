import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  const { id } = await params;
  const { name, chatId, type } = await request.json();
  const group = await prisma.group.update({ where: { id, userId: session.userId }, data: { name, chatId: chatId.toString(), type } });
  return NextResponse.json({ group });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  const { id } = await params;
  await prisma.group.delete({ where: { id, userId: session.userId } });
  return NextResponse.json({ message: "Deleted" });
}
