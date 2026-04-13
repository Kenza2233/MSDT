import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { APP_USER_ID } from "@/lib/config";

export async function GET() {
  try {
    let user = await prisma.user.findUnique({
      where: { id: APP_USER_ID },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: APP_USER_ID,
          email: "admin@localhost.com",
          name: "Admin",
          password: "unused",
        },
      });
    }

    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error("Init error:", error);
    return NextResponse.json({ success: false, message: "Init failed" }, { status: 500 });
  }
}
