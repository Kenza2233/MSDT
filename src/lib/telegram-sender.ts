import TelegramBot from "node-telegram-bot-api";
import prisma from "./prisma";
import fs from "fs";
import path from "path";

export async function processSendJob(jobId: string) {
  const job = await prisma.sendJob.findUnique({
    where: { id: jobId },
    include: {
      sendRecords: {
        include: {
          image: true,
          group: true,
        },
      },
      user: true,
    },
  });

  if (!job || !job.user.botToken) {
    console.error("Job or bot token not found for job:", jobId);
    return;
  }

  await prisma.sendJob.update({
    where: { id: jobId },
    data: { status: "processing", startedAt: new Date() },
  });

  const bot = new TelegramBot(job.user.botToken, { polling: false });

  // Group records by image to handle albums
  const recordsByImage = job.sendRecords.reduce((acc: any, record) => {
    if (!acc[record.imageId]) acc[record.imageId] = [];
    acc[record.imageId].push(record);
    return acc;
  }, {});

  const imageIds = Object.keys(recordsByImage);

  if (job.sendAsAlbum && imageIds.length > 1) {
    const recordsByGroup = job.sendRecords.reduce((acc: any, record) => {
      if (!acc[record.groupId]) acc[record.groupId] = [];
      acc[record.groupId].push(record);
      return acc;
    }, {});

    for (const groupId of Object.keys(recordsByGroup)) {
      const currentJob = await prisma.sendJob.findUnique({ where: { id: jobId } });
      if (currentJob?.status === "cancelled") break;

      const groupRecords = recordsByGroup[groupId];
      const chatId = groupRecords[0].group.chatId;

      for (let i = 0; i < groupRecords.length; i += 10) {
        const batch = groupRecords.slice(i, i + 10);
        const media: TelegramBot.InputMediaPhoto[] = batch.map((r: any, idx: number) => ({
          type: "photo",
          media: fs.createReadStream(path.join(process.cwd(), "public", r.image.filePath)),
          caption: idx === 0 ? (job.caption || r.image.caption || undefined) : undefined,
        }));

        try {
          await bot.sendMediaGroup(chatId, media);
          await prisma.sendRecord.updateMany({
            where: { id: { in: batch.map((r: any) => r.id) } },
            data: { status: "sent", sentAt: new Date() },
          });
          await prisma.sendJob.update({
            where: { id: jobId },
            data: { completedSends: { increment: batch.length } },
          });
        } catch (error: any) {
          await prisma.sendRecord.updateMany({
            where: { id: { in: batch.map((r: any) => r.id) } },
            data: { status: "failed", errorMessage: error.message },
          });
          await prisma.sendJob.update({
            where: { id: jobId },
            data: { failedSends: { increment: batch.length } },
          });
        }

        await new Promise((resolve) => setTimeout(resolve, job.delayMs));
      }
    }
  } else {
    for (const record of job.sendRecords) {
      const currentJob = await prisma.sendJob.findUnique({ where: { id: jobId } });
      if (currentJob?.status === "cancelled") break;

      try {
        const filePath = path.join(process.cwd(), "public", record.image.filePath);
        const caption = job.caption || record.image.caption || "";
        const msg = await bot.sendPhoto(record.group.chatId, fs.createReadStream(filePath), { caption });

        await prisma.sendRecord.update({
          where: { id: record.id },
          data: { status: "sent", sentAt: new Date(), telegramMsgId: msg.message_id },
        });
        await prisma.sendJob.update({
          where: { id: jobId },
          data: { completedSends: { increment: 1 } },
        });
      } catch (error: any) {
        let success = false;
        let lastError = error.message;

        for (let attempt = 1; attempt <= 2; attempt++) {
          await new Promise(r => setTimeout(r, job.delayMs * attempt));
          try {
            const filePath = path.join(process.cwd(), "public", record.image.filePath);
            const caption = job.caption || record.image.caption || "";
            const msg = await bot.sendPhoto(record.group.chatId, fs.createReadStream(filePath), { caption });
            await prisma.sendRecord.update({
              where: { id: record.id },
              data: { status: "sent", sentAt: new Date(), telegramMsgId: msg.message_id, retryCount: attempt },
            });
            await prisma.sendJob.update({
              where: { id: jobId },
              data: { completedSends: { increment: 1 } },
            });
            success = true;
            break;
          } catch (retryErr: any) { lastError = retryErr.message; }
        }

        if (!success) {
          await prisma.sendRecord.update({
            where: { id: record.id },
            data: { status: "failed", errorMessage: lastError },
          });
          await prisma.sendJob.update({
            where: { id: jobId },
            data: { failedSends: { increment: 1 } },
          });
        }
      }
      await new Promise((resolve) => setTimeout(resolve, job.delayMs));
    }
  }

  const finalJob = await prisma.sendJob.findUnique({ where: { id: jobId } });
  if (finalJob?.status !== "cancelled") {
    await prisma.sendJob.update({
      where: { id: jobId },
      data: { status: "completed", completedAt: new Date() },
    });
  }
}
