import TelegramBot from "node-telegram-bot-api";
import prisma from "./prisma";
import fs from "fs";
import path from "path";
import { Prisma } from "@prisma/client";

type RecordWithRelations = Prisma.SendRecordGetPayload<{
  include: { image: true; group: true }
}>;

export async function processSendJob(jobId: number) {
  const job = await prisma.sendJob.findUnique({
    where: { id: jobId },
    include: {
      records: {
        include: {
          image: true,
          group: true,
        },
      },
      user: true,
    },
  });

  if (!job || !job.user.botToken) {
    console.error(`Job ${jobId} not found or bot token missing`);
    return;
  }

  await prisma.sendJob.update({
    where: { id: jobId },
    data: { status: "processing", startedAt: new Date() },
  });

  const bot = new TelegramBot(job.user.botToken, { polling: false });

  try {
    const records = job.records;

    if (job.sendAsAlbum) {
      const groupedByGroup = records.reduce((acc: Record<number, RecordWithRelations[]>, record) => {
        if (!acc[record.groupId]) acc[record.groupId] = [];
        acc[record.groupId].push(record as RecordWithRelations);
        return acc;
      }, {});

      for (const groupIdStr in groupedByGroup) {
        const groupId = parseInt(groupIdStr);
        const groupRecords = groupedByGroup[groupId];
        const group = groupRecords[0].group;

        const currentJob = await prisma.sendJob.findUnique({ where: { id: jobId } });
        if (currentJob?.status === "cancelled") break;

        const batchSize = Math.min(job.albumSize, 10);
        for (let i = 0; i < groupRecords.length; i += batchSize) {
          const batch = groupRecords.slice(i, i + batchSize);

          const media: TelegramBot.InputMediaPhoto[] = batch.map((r, index) => {
            const filePath = path.join(process.cwd(), "public", r.image.filePath);
            let itemCaption = undefined;
            if (index === 0) {
              itemCaption = job.caption || r.image.caption || undefined;
            }

            return {
              type: "photo",
              media: fs.createReadStream(filePath) as any, // node-telegram-bot-api types can be picky with streams
              caption: itemCaption,
              parse_mode: 'HTML'
            };
          });

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

          } catch (err: any) {
            console.error("Album send error:", err);
            await prisma.sendRecord.updateMany({
              where: { id: { in: batch.map((r: any) => r.id) } },
              data: { status: "failed", errorMessage: err.message },
            });
            await prisma.sendJob.update({
              where: { id: jobId },
              data: { failedSends: { increment: batch.length } },
            });
          }

          if (i + batchSize < groupRecords.length) {
            await new Promise(resolve => setTimeout(resolve, job.delayMs));
          }
        }

        await new Promise(resolve => setTimeout(resolve, job.delayMs));
      }
    } else {
      for (const record of records) {
        const currentJob = await prisma.sendJob.findUnique({ where: { id: jobId } });
        if (currentJob?.status === "cancelled") break;

        let attempt = 0;
        let success = false;
        let lastError = "";

        while (attempt < 3 && !success) {
          try {
            const filePath = path.join(process.cwd(), "public", record.image.filePath);
            const stream = fs.createReadStream(filePath);
            const finalCaption = job.caption || record.image.caption || undefined;

            const result = await bot.sendPhoto(record.group.chatId, stream, {
              caption: finalCaption,
              parse_mode: 'HTML'
            });

            await prisma.sendRecord.update({
              where: { id: record.id },
              data: { status: "sent", sentAt: new Date(), telegramMsgId: result.message_id.toString() },
            });

            await prisma.sendJob.update({
              where: { id: jobId },
              data: { completedSends: { increment: 1 } },
            });

            success = true;
          } catch (err: any) {
            attempt++;
            lastError = err.message;
            if (err.response?.status === 429) {
                const retryAfter = (err.response?.body?.parameters?.retry_after || 5) * 1000;
                await new Promise(resolve => setTimeout(resolve, retryAfter));
            } else {
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
          }
        }

        if (!success) {
          await prisma.sendRecord.update({
            where: { id: record.id },
            data: { status: "failed", errorMessage: lastError, retryCount: attempt },
          });
          await prisma.sendJob.update({
            where: { id: jobId },
            data: { failedSends: { increment: 1 } },
          });
        }

        await new Promise(resolve => setTimeout(resolve, job.delayMs));
      }
    }

    const finalJob = await prisma.sendJob.findUnique({ where: { id: jobId } });
    if (finalJob?.status !== "cancelled") {
      await prisma.sendJob.update({
        where: { id: jobId },
        data: {
            status: finalJob?.failedSends === job.totalSends ? "failed" : "completed",
            completedAt: new Date()
        },
      });
    }

  } catch (globalErr) {
    console.error("Global job error:", globalErr);
    await prisma.sendJob.update({
      where: { id: jobId },
      data: { status: "failed", completedAt: new Date() },
    });
  }
}
