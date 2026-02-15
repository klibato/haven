import { prisma } from "../config/database.js";
import { NotFoundError, ConflictError, AppError } from "../utils/errors.js";
import { requirePermission, Permissions } from "../utils/permissions.js";
import { generateInviteCode } from "../utils/snowflake.js";

export async function createInvite(
  serverId: string,
  userId: string,
  data: { maxUses?: number | null; expiresIn?: number | null },
) {
  await requirePermission(userId, serverId, Permissions.CREATE_INVITE);

  const expiresAt = data.expiresIn
    ? new Date(Date.now() + data.expiresIn * 1000)
    : null;

  return prisma.invite.create({
    data: {
      code: generateInviteCode(),
      serverId,
      maxUses: data.maxUses,
      expiresAt,
    },
  });
}

export async function getInvitePreview(code: string) {
  const invite = await prisma.invite.findUnique({
    where: { code },
    include: {
      server: {
        include: { _count: { select: { members: true } } },
      },
    },
  });

  if (!invite) throw new NotFoundError("Invite");

  if (invite.expiresAt && invite.expiresAt < new Date()) {
    throw new AppError(410, "This invite has expired");
  }

  if (invite.maxUses && invite.uses >= invite.maxUses) {
    throw new AppError(410, "This invite has reached its maximum uses");
  }

  return {
    code: invite.code,
    server: {
      name: invite.server.name,
      iconUrl: invite.server.iconUrl,
      memberCount: invite.server._count.members,
    },
  };
}

export async function joinServer(code: string, userId: string) {
  const invite = await prisma.invite.findUnique({
    where: { code },
    include: { server: true },
  });

  if (!invite) throw new NotFoundError("Invite");

  if (invite.expiresAt && invite.expiresAt < new Date()) {
    throw new AppError(410, "This invite has expired");
  }

  if (invite.maxUses && invite.uses >= invite.maxUses) {
    throw new AppError(410, "This invite has reached its maximum uses");
  }

  // Check if already a member
  const existing = await prisma.member.findUnique({
    where: { userId_serverId: { userId, serverId: invite.serverId } },
  });
  if (existing) throw new ConflictError("You are already a member of this server");

  // Join and increment uses
  const [member] = await prisma.$transaction([
    prisma.member.create({
      data: { userId, serverId: invite.serverId },
      include: {
        user: {
          select: { id: true, username: true, displayName: true, avatarUrl: true, status: true, customStatus: true },
        },
      },
    }),
    prisma.invite.update({
      where: { id: invite.id },
      data: { uses: { increment: 1 } },
    }),
  ]);

  return member;
}
