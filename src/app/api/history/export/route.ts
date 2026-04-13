import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const records = await prisma.sendRecord.findMany({
      where: { job: { userId: session.userId } },
      include: {
        image: true,
        group: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const headers = ["Date", "Image", "Group", "Type", "Status", "Error", "TelegramMsgId"];
    const rows = records.map(r => [
      new Date(r.createdAt).toISOString(),
      r.image.originalName,
      r.group.name,
      r.group.type,
      r.status,
      r.errorMessage || "",
      r.telegramMsgId || ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=send-history.csv"
      }
    });
  } catch (error) {
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
