import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { APP_USER_ID } from "@/lib/config";

export async function PUT(request: Request) {
  try {
    const { name, email, botToken } = await request.json();

    const updatedUser = await prisma.user.update({
      where: { id: APP_USER_ID },
      data: {
        name,
        email,
        botToken
      }
    });

    return NextResponse.json({ user: { name: updatedUser.name, email: updatedUser.email } });
  } catch (error) {
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { type } = await request.json();

    if (type === "history") {
      await prisma.sendRecord.deleteMany({ where: { job: { userId: APP_USER_ID } } });
      await prisma.sendJob.deleteMany({ where: { userId: APP_USER_ID } });
      return NextResponse.json({ message: "History cleared" });
    }

    if (type === "images") {
      await prisma.image.deleteMany({ where: { userId: APP_USER_ID } });
      return NextResponse.json({ message: "Images cleared" });
    }

    return NextResponse.json({ message: "Invalid type" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
