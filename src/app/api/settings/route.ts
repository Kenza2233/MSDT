import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { name, email, botToken } = await request.json();

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
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
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { type } = await request.json();

    if (type === "history") {
      await prisma.sendRecord.deleteMany({ where: { job: { userId: session.userId } } });
      await prisma.sendJob.deleteMany({ where: { userId: session.userId } });
      return NextResponse.json({ message: "History cleared" });
    }

    if (type === "images") {
      await prisma.sendRecord.deleteMany({ where: { image: { userId: session.userId } } });
      await prisma.image.deleteMany({ where: { userId: session.userId } });
      return NextResponse.json({ message: "Images cleared" });
    }

    return NextResponse.json({ message: "Invalid type" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
