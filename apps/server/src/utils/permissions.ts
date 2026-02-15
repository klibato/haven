import { hasPermission, Permissions } from "@haven/shared";
import { prisma } from "../config/database.js";
import { ForbiddenError } from "./errors.js";

export async function getMemberPermissions(userId: string, serverId: string): Promise<bigint> {
  const server = await prisma.server.findUnique({
    where: { id: serverId },
    select: { ownerId: true },
  });

  if (!server) return 0n;

  // Server owner has all permissions
  if (server.ownerId === userId) {
    return ~0n; // All bits set
  }

  const member = await prisma.member.findUnique({
    where: { userId_serverId: { userId, serverId } },
    include: {
      roles: {
        include: { role: true },
      },
    },
  });

  if (!member) return 0n;

  // Combine all role permissions
  let permissions = 0n;
  for (const memberRole of member.roles) {
    permissions |= memberRole.role.permissions;
  }

  return permissions;
}

export async function requirePermission(
  userId: string,
  serverId: string,
  permission: bigint,
): Promise<void> {
  const userPermissions = await getMemberPermissions(userId, serverId);
  if (!hasPermission(userPermissions, permission)) {
    throw new ForbiddenError("You do not have permission to perform this action");
  }
}

export async function requireServerMember(userId: string, serverId: string) {
  const member = await prisma.member.findUnique({
    where: { userId_serverId: { userId, serverId } },
  });
  if (!member) {
    throw new ForbiddenError("You are not a member of this server");
  }
  return member;
}

export { Permissions, hasPermission };
