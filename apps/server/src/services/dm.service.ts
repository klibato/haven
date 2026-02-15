import { prisma } from "../config/database.js";
import { NotFoundError, ForbiddenError } from "../utils/errors.js";

const participantSelect = {
  user: {
    select: { id: true, username: true, displayName: true, avatarUrl: true, status: true, customStatus: true },
  },
} as const;

export async function getDMConversations(userId: string) {
  const conversations = await prisma.dMConversation.findMany({
    where: {
      participants: { some: { userId } },
    },
    include: {
      participants: { include: participantSelect },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return conversations.map((c) => ({
    id: c.id,
    participants: c.participants.map((p) => p.user),
    lastMessage: c.messages[0] ?? null,
    createdAt: c.createdAt.toISOString(),
  }));
}

export async function createDMConversation(userId: string, recipientId: string) {
  // Check if recipient exists
  const recipient = await prisma.user.findUnique({ where: { id: recipientId } });
  if (!recipient) throw new NotFoundError("User");

  // Check if conversation already exists
  const existing = await prisma.dMConversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId } } },
        { participants: { some: { userId: recipientId } } },
      ],
    },
    include: {
      participants: { include: participantSelect },
    },
  });

  if (existing) {
    return {
      id: existing.id,
      participants: existing.participants.map((p) => p.user),
      createdAt: existing.createdAt.toISOString(),
    };
  }

  const conversation = await prisma.dMConversation.create({
    data: {
      participants: {
        create: [
          { userId },
          { userId: recipientId },
        ],
      },
    },
    include: {
      participants: { include: participantSelect },
    },
  });

  return {
    id: conversation.id,
    participants: conversation.participants.map((p) => p.user),
    createdAt: conversation.createdAt.toISOString(),
  };
}

export async function getDMMessages(
  conversationId: string,
  userId: string,
  options: { limit?: number; before?: string },
) {
  // Verify user is a participant
  const participant = await prisma.dMParticipant.findUnique({
    where: { userId_conversationId: { userId, conversationId } },
  });
  if (!participant) throw new ForbiddenError("You are not a participant in this conversation");

  const where: { conversationId: string; createdAt?: { lt: Date } } = { conversationId };
  if (options.before) {
    const beforeMsg = await prisma.dMMessage.findUnique({ where: { id: options.before } });
    if (beforeMsg) {
      where.createdAt = { lt: beforeMsg.createdAt };
    }
  }

  return prisma.dMMessage.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: options.limit ?? 50,
  });
}

export async function createDMMessage(
  conversationId: string,
  userId: string,
  content: string,
) {
  // Verify user is a participant
  const participant = await prisma.dMParticipant.findUnique({
    where: { userId_conversationId: { userId, conversationId } },
  });
  if (!participant) throw new ForbiddenError("You are not a participant in this conversation");

  return prisma.dMMessage.create({
    data: {
      content,
      authorId: userId,
      conversationId,
    },
  });
}
