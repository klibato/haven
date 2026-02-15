import { Server, Socket } from "socket.io";
import * as messageService from "../../services/message.service.js";

export function registerMessageHandlers(io: Server, socket: Socket) {
  const userId = socket.data.userId as string;

  socket.on("message:send", async (data: { channelId: string; content: string; replyToId?: string }) => {
    try {
      const message = await messageService.createMessage(data.channelId, userId, {
        content: data.content,
        replyToId: data.replyToId,
      });
      io.to(`channel:${data.channelId}`).emit("message:new", { message });
    } catch (error) {
      socket.emit("error", { message: error instanceof Error ? error.message : "Failed to send message" });
    }
  });

  socket.on("message:edit", async (data: { messageId: string; content: string }) => {
    try {
      const message = await messageService.updateMessage(data.messageId, userId, data.content);
      io.to(`channel:${message.channelId}`).emit("message:updated", { message });
    } catch (error) {
      socket.emit("error", { message: error instanceof Error ? error.message : "Failed to edit message" });
    }
  });

  socket.on("message:delete", async (data: { messageId: string }) => {
    try {
      const result = await messageService.deleteMessage(data.messageId, userId);
      io.to(`channel:${result.channelId}`).emit("message:deleted", {
        messageId: result.messageId,
        channelId: result.channelId,
      });
    } catch (error) {
      socket.emit("error", { message: error instanceof Error ? error.message : "Failed to delete message" });
    }
  });
}
