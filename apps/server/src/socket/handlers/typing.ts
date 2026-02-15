import { Server, Socket } from "socket.io";
import { TYPING_TIMEOUT_MS } from "@haven/shared";

const typingTimers = new Map<string, NodeJS.Timeout>();

export function registerTypingHandlers(io: Server, socket: Socket) {
  const userId = socket.data.userId as string;
  const username = socket.data.username as string;

  socket.on("typing:start", (data: { channelId: string }) => {
    const key = `${userId}:${data.channelId}`;

    // Clear existing timer
    const existing = typingTimers.get(key);
    if (existing) clearTimeout(existing);

    // Broadcast to channel
    socket.to(`channel:${data.channelId}`).emit("typing:update", {
      channelId: data.channelId,
      userId,
      username,
    });

    // Auto-stop after timeout
    typingTimers.set(
      key,
      setTimeout(() => {
        typingTimers.delete(key);
      }, TYPING_TIMEOUT_MS),
    );
  });

  socket.on("typing:stop", (data: { channelId: string }) => {
    const key = `${userId}:${data.channelId}`;
    const existing = typingTimers.get(key);
    if (existing) {
      clearTimeout(existing);
      typingTimers.delete(key);
    }
  });
}
