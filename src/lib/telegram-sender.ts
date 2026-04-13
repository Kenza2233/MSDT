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
    console.error(`Job ${jobId} or bot token not found.`);
    return;
  }

  await prisma.sendJob.update({
    where: { id: jobId },
    data: { status: "processing", startedAt: new Date() },
  });

  const bot = new TelegramBot(job.user.botToken, { polling: false });

  if (job.sendAsAlbum) {
    // Logic for sending as album (MediaGroup)
    // Group records by group
    const recordsByGroup = job.sendRecords.reduce((acc: any, record) => {
      if (!acc[record.groupId]) acc[record.groupId] = [];
      acc[record.groupId].push(record);
      return acc;
    }, {});

    for (const groupId in recordsByGroup) {
      const currentJob = await prisma.sendJob.findUnique({ where: { id: jobId } });
      if (currentJob?.status === "cancelled") break;

      const groupRecords = recordsByGroup[groupId];
      const group = groupRecords[0].group;

      // Split into batches of 10
      for (let i = 0; i < groupRecords.length; i += 10) {
        const batch = groupRecords.slice(i, i + 10);
        const media: any[] = batch.map((r: any) => ({
          type: "photo",
          media: fs.createReadStream(path.join(process.cwd(), "public", r.image.filePath)),
          caption: r.image.caption || undefined,
        }));

        try {
          await bot.sendMediaGroup(group.chatId, media);
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
    // One by one
    for (const record of job.sendRecords) {
      const currentJob = await prisma.sendJob.findUnique({ where: { id: jobId } });
      if (currentJob?.status === "cancelled") break;

      try {
        const sentMsg = await bot.sendPhoto(
          record.group.chatId,
          fs.createReadStream(path.join(process.cwd(), "public", record.image.filePath)),
          { caption: record.image.caption || undefined }
        );

        await prisma.sendRecord.update({
          where: { id: record.id },
          data: { status: "sent", sentAt: new Date(), telegramMsgId: sentMsg.message_id },
        });
        await prisma.sendJob.update({
          where: { id: jobId },
          data: { completedSends: { increment: 1 } },
        });
      } catch (error: any) {
        let success = false;
        let errorMessage = error.message;

        // Simple retry logic
        for (let attempt = 1; attempt <= 3; attempt++) {
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          try {
             const sentMsg = await bot.sendPhoto(
              record.group.chatId,
              fs.createReadStream(path.join(process.cwd(), "public", record.image.filePath)),
              { caption: record.image.caption || undefined }
            );
            await prisma.sendRecord.update({
              where: { id: record.id },
              data: { status: "sent", sentAt: new Date(), telegramMsgId: sentMsg.message_id, retryCount: attempt },
            });
            await prisma.sendJob.update({
              where: { id: jobId },
              data: { completedSends: { increment: 1 } },
            });
            success = true;
            break;
          } catch (retryError: any) {
            errorMessage = retryError.message;
          }
        }

        if (!success) {
          await prisma.sendRecord.update({
            where: { id: record.id },
            data: { status: "failed", errorMessage },
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
