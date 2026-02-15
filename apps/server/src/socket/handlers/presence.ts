import { Server, Socket } from "socket.io";
import { prisma } from "../../config/database.js";
import type { UserStatus } from "@haven/shared";

// Track which sockets belong to which user
const userSockets = new Map<string, Set<string>>();

export function registerPresenceHandlers(io: Server, socket: Socket) {
  const userId = socket.data.userId as string;

  // Track this socket
  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set());
  }
  userSockets.get(userId)!.add(socket.id);

  // Set user online
  updatePresence(io, userId, "online");

  socket.on("presence:update", async (data: { status: UserStatus }) => {
    await updatePresence(io, userId, data.status);
  });

  socket.on("disconnect", async () => {
    const sockets = userSockets.get(userId);
    if (sockets) {
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        userSockets.delete(userId);
        await updatePresence(io, userId, "offline");
      }
    }
  });
}

async function updatePresence(io: Server, userId: string, status: UserStatus) {
  await prisma.user.update({
    where: { id: userId },
    data: { status },
  });

  // Get all servers the user is in to broadcast presence
  const memberships = await prisma.member.findMany({
    where: { userId },
    select: { serverId: true },
  });

  for (const membership of memberships) {
    io.to(`server:${membership.serverId}`).emit("presence:updated", { userId, status });
  }
}

export function isUserOnline(userId: string): boolean {
  const sockets = userSockets.get(userId);
  return sockets !== undefined && sockets.size > 0;
}
