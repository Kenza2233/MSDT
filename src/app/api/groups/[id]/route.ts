import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { APP_USER_ID } from "@/lib/config";

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { title, chatId, type } = await req.json();
    const group = await prisma.group.update({
      where: { id: parseInt(params.id), userId: APP_USER_ID },
      data: { title, chatId: chatId.toString(), type },
    });
    return NextResponse.json(group);
  } catch (error) {
    return NextResponse.json({ message: "Error updating group" }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    await prisma.group.delete({
      where: { id: parseInt(params.id), userId: APP_USER_ID },
    });
    return NextResponse.json({ message: "Group deleted" });
  } catch (error) {
    return NextResponse.json({ message: "Error deleting group" }, { status: 500 });
  }
}
