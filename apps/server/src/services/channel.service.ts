import { prisma } from "../config/database.js";
import { NotFoundError } from "../utils/errors.js";
import { requirePermission, requireServerMember, Permissions } from "../utils/permissions.js";

export async function getServerChannels(serverId: string, userId: string) {
  await requireServerMember(userId, serverId);

  return prisma.channel.findMany({
    where: { serverId },
    orderBy: { position: "asc" },
  });
}

export async function createChannel(
  serverId: string,
  userId: string,
  data: { name: string; type?: "TEXT" | "VOICE" | "CATEGORY"; topic?: string | null; categoryId?: string | null },
) {
  await requirePermission(userId, serverId, Permissions.MANAGE_CHANNELS);

  const maxPosition = await prisma.channel.aggregate({
    where: { serverId },
    _max: { position: true },
  });

  return prisma.channel.create({
    data: {
      name: data.name,
      type: data.type ?? "TEXT",
      topic: data.topic,
      categoryId: data.categoryId,
      position: (maxPosition._max.position ?? -1) + 1,
      serverId,
    },
  });
}

export async function updateChannel(
  channelId: string,
  userId: string,
  data: { name?: string; topic?: string | null; position?: number },
) {
  const channel = await prisma.channel.findUnique({ where: { id: channelId } });
  if (!channel) throw new NotFoundError("Channel");

  await requirePermission(userId, channel.serverId, Permissions.MANAGE_CHANNELS);

  return prisma.channel.update({
    where: { id: channelId },
    data,
  });
}

export async function deleteChannel(channelId: string, userId: string) {
  const channel = await prisma.channel.findUnique({ where: { id: channelId } });
  if (!channel) throw new NotFoundError("Channel");

  await requirePermission(userId, channel.serverId, Permissions.MANAGE_CHANNELS);

  await prisma.channel.delete({ where: { id: channelId } });
}
