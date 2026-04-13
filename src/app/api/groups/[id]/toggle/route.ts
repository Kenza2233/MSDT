import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  const { id } = await params;
  const group = await prisma.group.findUnique({ where: { id, userId: session.userId } });
  if (!group) return NextResponse.json({ message: "Not found" }, { status: 404 });
  const updated = await prisma.group.update({ where: { id }, data: { isActive: !group.isActive } });
  return NextResponse.json({ group: updated });
}
