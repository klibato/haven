import { DEFAULT_PERMISSIONS } from "@haven/shared";
import { prisma } from "../config/database.js";
import { NotFoundError, ForbiddenError } from "../utils/errors.js";

export async function createServer(name: string, ownerId: string, iconUrl?: string | null) {
  const server = await prisma.server.create({
    data: {
      name,
      iconUrl,
      ownerId,
      channels: {
        create: [
          { name: "general", type: "TEXT", position: 0 },
          { name: "General", type: "VOICE", position: 1 },
        ],
      },
      members: {
        create: { userId: ownerId },
      },
      roles: {
        create: {
          name: "@everyone",
          permissions: DEFAULT_PERMISSIONS,
          position: 0,
        },
      },
    },
    include: {
      channels: true,
      members: { include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true, status: true, customStatus: true } } } },
      _count: { select: { members: true } },
    },
  });

  return { ...server, memberCount: server._count.members };
}

export async function getUserServers(userId: string) {
  const memberships = await prisma.member.findMany({
    where: { userId },
    include: {
      server: {
        include: {
          channels: { orderBy: { position: "asc" } },
          _count: { select: { members: true } },
        },
      },
    },
  });

  return memberships.map((m) => ({
    ...m.server,
    memberCount: m.server._count.members,
  }));
}

export async function getServerById(serverId: string, userId: string) {
  const member = await prisma.member.findUnique({
    where: { userId_serverId: { userId, serverId } },
  });
  if (!member) throw new ForbiddenError("You are not a member of this server");

  const server = await prisma.server.findUnique({
    where: { id: serverId },
    include: {
      channels: { orderBy: { position: "asc" } },
      _count: { select: { members: true } },
    },
  });
  if (!server) throw new NotFoundError("Server");

  return { ...server, memberCount: server._count.members };
}

export async function updateServer(
  serverId: string,
  userId: string,
  data: { name?: string; iconUrl?: string | null },
) {
  const server = await prisma.server.findUnique({ where: { id: serverId } });
  if (!server) throw new NotFoundError("Server");
  if (server.ownerId !== userId) throw new ForbiddenError("Only the owner can update the server");

  return prisma.server.update({
    where: { id: serverId },
    data,
  });
}

export async function deleteServer(serverId: string, userId: string) {
  const server = await prisma.server.findUnique({ where: { id: serverId } });
  if (!server) throw new NotFoundError("Server");
  if (server.ownerId !== userId) throw new ForbiddenError("Only the owner can delete the server");

  await prisma.server.delete({ where: { id: serverId } });
}

export async function leaveServer(serverId: string, userId: string) {
  const server = await prisma.server.findUnique({ where: { id: serverId } });
  if (!server) throw new NotFoundError("Server");
  if (server.ownerId === userId) throw new ForbiddenError("Server owner cannot leave. Transfer ownership or delete the server.");

  const member = await prisma.member.findUnique({
    where: { userId_serverId: { userId, serverId } },
  });
  if (!member) throw new NotFoundError("Membership");

  await prisma.member.delete({
    where: { userId_serverId: { userId, serverId } },
  });
}
