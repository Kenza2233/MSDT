import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { APP_USER_ID } from "@/lib/config";

export async function GET() {
  try {
    const records = await prisma.sendRecord.findMany({
      where: { job: { userId: APP_USER_ID } },
      include: {
        image: true,
        group: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const headers = ["Date", "Image", "Group", "Type", "Status", "TelegramMsgId", "Error"];
    const rows = records.map((r) => [
      r.createdAt.toISOString(),
      r.image.fileName,
      r.group.title,
      r.group.type,
      r.status,
      r.telegramMsgId || "",
      r.errorMessage || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=history.csv",
      },
    });
  } catch (error) {
    return NextResponse.json({ message: "Error exporting history" }, { status: 500 });
  }
}
