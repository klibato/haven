import { prisma } from "../config/database.js";
import { NotFoundError } from "../utils/errors.js";
import { requirePermission, requireServerMember, Permissions } from "../utils/permissions.js";

const memberInclude = {
  user: {
    select: { id: true, username: true, displayName: true, avatarUrl: true, status: true, customStatus: true },
  },
  roles: {
    include: { role: true },
  },
} as const;

export async function getServerMembers(serverId: string, userId: string) {
  await requireServerMember(userId, serverId);

  const members = await prisma.member.findMany({
    where: { serverId },
    include: memberInclude,
    orderBy: { joinedAt: "asc" },
  });

  return members.map((m) => ({
    ...m,
    roles: m.roles.map((mr) => mr.role),
  }));
}

export async function updateMember(
  serverId: string,
  targetUserId: string,
  userId: string,
  data: { nickname?: string | null; roleIds?: string[] },
) {
  const member = await prisma.member.findUnique({
    where: { userId_serverId: { userId: targetUserId, serverId } },
  });
  if (!member) throw new NotFoundError("Member");

  // If updating someone else, require MANAGE_ROLES
  if (targetUserId !== userId && data.roleIds) {
    await requirePermission(userId, serverId, Permissions.MANAGE_ROLES);
  }

  // Update nickname (anyone can change their own)
  if (data.nickname !== undefined && targetUserId !== userId) {
    await requirePermission(userId, serverId, Permissions.MANAGE_ROLES);
  }

  const updateData: { nickname?: string | null } = {};
  if (data.nickname !== undefined) updateData.nickname = data.nickname;

  const updated = await prisma.member.update({
    where: { id: member.id },
    data: updateData,
    include: memberInclude,
  });

  // Update roles if provided
  if (data.roleIds) {
    // Remove existing roles
    await prisma.memberRole.deleteMany({ where: { memberId: member.id } });
    // Add new roles
    if (data.roleIds.length > 0) {
      await prisma.memberRole.createMany({
        data: data.roleIds.map((roleId) => ({ memberId: member.id, roleId })),
      });
    }
  }

  const result = await prisma.member.findUnique({
    where: { id: member.id },
    include: memberInclude,
  });

  return result ? { ...result, roles: result.roles.map((mr) => mr.role) } : updated;
}

export async function kickMember(serverId: string, targetUserId: string, userId: string) {
  await requirePermission(userId, serverId, Permissions.KICK_MEMBERS);

  const member = await prisma.member.findUnique({
    where: { userId_serverId: { userId: targetUserId, serverId } },
  });
  if (!member) throw new NotFoundError("Member");

  const server = await prisma.server.findUnique({ where: { id: serverId } });
  if (server?.ownerId === targetUserId) {
    throw new Error("Cannot kick the server owner");
  }

  await prisma.member.delete({
    where: { userId_serverId: { userId: targetUserId, serverId } },
  });
}

// Roles
export async function createRole(
  serverId: string,
  userId: string,
  data: { name: string; color?: string | null; permissions?: string },
) {
  await requirePermission(userId, serverId, Permissions.MANAGE_ROLES);

  const maxPosition = await prisma.role.aggregate({
    where: { serverId },
    _max: { position: true },
  });

  return prisma.role.create({
    data: {
      name: data.name,
      color: data.color,
      permissions: data.permissions ? BigInt(data.permissions) : 0n,
      position: (maxPosition._max.position ?? 0) + 1,
      serverId,
    },
  });
}

export async function updateRole(
  roleId: string,
  userId: string,
  data: { name?: string; color?: string | null; permissions?: string },
) {
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) throw new NotFoundError("Role");

  await requirePermission(userId, role.serverId, Permissions.MANAGE_ROLES);

  return prisma.role.update({
    where: { id: roleId },
    data: {
      name: data.name,
      color: data.color,
      permissions: data.permissions ? BigInt(data.permissions) : undefined,
    },
  });
}

export async function deleteRole(roleId: string, userId: string) {
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) throw new NotFoundError("Role");

  await requirePermission(userId, role.serverId, Permissions.MANAGE_ROLES);

  if (role.name === "@everyone") {
    throw new Error("Cannot delete the @everyone role");
  }

  await prisma.role.delete({ where: { id: roleId } });
}
