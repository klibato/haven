import { prisma } from "../config/database.js";
import { NotFoundError, ForbiddenError } from "../utils/errors.js";
import { requireServerMember, requirePermission, Permissions } from "../utils/permissions.js";

const messageInclude = {
  author: {
    select: { id: true, username: true, displayName: true, avatarUrl: true, status: true, customStatus: true },
  },
  attachments: true,
  replyTo: {
    include: {
      author: {
        select: { id: true, username: true, displayName: true, avatarUrl: true, status: true, customStatus: true },
      },
    },
  },
} as const;

export async function getMessages(
  channelId: string,
  userId: string,
  options: { limit?: number; before?: string },
) {
  const channel = await prisma.channel.findUnique({ where: { id: channelId } });
  if (!channel) throw new NotFoundError("Channel");

  await requireServerMember(userId, channel.serverId);

  const where: { channelId: string; createdAt?: { lt: Date } } = { channelId };
  if (options.before) {
    const beforeMessage = await prisma.message.findUnique({ where: { id: options.before } });
    if (beforeMessage) {
      where.createdAt = { lt: beforeMessage.createdAt };
    }
  }

  return prisma.message.findMany({
    where,
    include: messageInclude,
    orderBy: { createdAt: "desc" },
    take: options.limit ?? 50,
  });
}

export async function createMessage(
  channelId: string,
  userId: string,
  data: { content: string; replyToId?: string | null },
) {
  const channel = await prisma.channel.findUnique({ where: { id: channelId } });
  if (!channel) throw new NotFoundError("Channel");

  await requirePermission(userId, channel.serverId, Permissions.SEND_MESSAGES);

  return prisma.message.create({
    data: {
      content: data.content,
      authorId: userId,
      channelId,
      replyToId: data.replyToId,
    },
    include: messageInclude,
  });
}

export async function updateMessage(messageId: string, userId: string, content: string) {
  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) throw new NotFoundError("Message");
  if (message.authorId !== userId) throw new ForbiddenError("You can only edit your own messages");

  return prisma.message.update({
    where: { id: messageId },
    data: { content, editedAt: new Date() },
    include: messageInclude,
  });
}

export async function deleteMessage(messageId: string, userId: string) {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: { channel: true },
  });
  if (!message) throw new NotFoundError("Message");

  if (message.authorId !== userId) {
    // Check if user has MANAGE_MESSAGES permission
    await requirePermission(userId, message.channel.serverId, Permissions.MANAGE_MESSAGES);
  }

  await prisma.message.delete({ where: { id: messageId } });
  return { messageId, channelId: message.channelId };
}
