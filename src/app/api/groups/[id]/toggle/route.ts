import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { APP_USER_ID } from "@/lib/config";

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const group = await prisma.group.findUnique({
      where: { id: parseInt(params.id), userId: APP_USER_ID },
    });

    if (!group) return NextResponse.json({ message: "Group not found" }, { status: 404 });

    const updated = await prisma.group.update({
      where: { id: group.id },
      data: { isActive: !group.isActive },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: "Error toggling group" }, { status: 500 });
  }
}
