import { Server, Socket } from "socket.io";

// Track voice channel state
const voiceChannels = new Map<string, Set<string>>(); // channelId -> Set<userId>

export function registerVoiceHandlers(io: Server, socket: Socket) {
  const userId = socket.data.userId as string;

  socket.on("voice:join", (data: { channelId: string }) => {
    if (!voiceChannels.has(data.channelId)) {
      voiceChannels.set(data.channelId, new Set());
    }
    voiceChannels.get(data.channelId)!.add(userId);

    socket.join(`voice:${data.channelId}`);
    io.to(`voice:${data.channelId}`).emit("voice:user_joined", {
      channelId: data.channelId,
      userId,
    });
  });

  socket.on("voice:leave", (data: { channelId: string }) => {
    voiceChannels.get(data.channelId)?.delete(userId);
    socket.leave(`voice:${data.channelId}`);
    io.to(`voice:${data.channelId}`).emit("voice:user_left", {
      channelId: data.channelId,
      userId,
    });
  });

  socket.on("voice:mute", (data: { muted: boolean }) => {
    // Find the voice channel this user is in
    for (const [channelId, users] of voiceChannels) {
      if (users.has(userId)) {
        io.to(`voice:${channelId}`).emit("voice:mute_update", {
          channelId,
          userId,
          muted: data.muted,
        });
        break;
      }
    }
  });

  socket.on("disconnect", () => {
    // Remove from all voice channels
    for (const [channelId, users] of voiceChannels) {
      if (users.delete(userId)) {
        io.to(`voice:${channelId}`).emit("voice:user_left", { channelId, userId });
      }
    }
  });
}

export function getVoiceChannelUsers(channelId: string): string[] {
  return Array.from(voiceChannels.get(channelId) ?? []);
}
