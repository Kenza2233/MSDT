import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "No session" }, { status: 401 });
  await prisma.user.delete({ where: { id: session.userId } });
  const response = NextResponse.json({ message: "Deleted" });
  response.cookies.delete("auth_token");
  return response;
}
