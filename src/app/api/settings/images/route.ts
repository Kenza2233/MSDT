import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
export async function DELETE() {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "No session" }, { status: 401 });
  await prisma.image.deleteMany({ where: { userId: session.userId } });
  return NextResponse.json({ message: "Deleted" });
}
