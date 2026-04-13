import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { APP_USER_ID } from "@/lib/config";

export async function DELETE() {
  try {
    await prisma.sendJob.deleteMany({
      where: { userId: APP_USER_ID },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: "Error clearing history" }, { status: 500 });
  }
}
