import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
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

    const updatedGroup = await prisma.group.update({
      where: { id: params.id },
      data: { isActive: !group.isActive },
    });

    return NextResponse.json({ group: updatedGroup });
  } catch (error) {
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(
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

    await prisma.group.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Group deleted" });
  } catch (error) {
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
