import { useEffect } from "react";
import { getSocket, connectSocket, disconnectSocket } from "@/lib/socket";
import { useMessageStore } from "@/stores/messageStore";
import { useServerStore } from "@/stores/serverStore";
import { useAuthStore } from "@/stores/authStore";
import type { Message } from "@haven/shared";

export function useSocket() {
  const { isAuthenticated } = useAuthStore();
  const { addMessage, updateMessage, removeMessage } = useMessageStore();
  const { loadMembers, activeServerId } = useServerStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    connectSocket();
    const socket = getSocket();

    socket.on("message:new", (data: { message: Message }) => {
      addMessage(data.message.channelId, data.message);
    });

    socket.on("message:updated", (data: { message: Message }) => {
      updateMessage(data.message);
    });

    socket.on("message:deleted", (data: { messageId: string; channelId: string }) => {
      removeMessage(data.messageId, data.channelId);
    });

    socket.on("member:join", () => {
      if (activeServerId) loadMembers(activeServerId);
    });

    socket.on("member:leave", () => {
      if (activeServerId) loadMembers(activeServerId);
    });

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated]);

  return getSocket();
}

export function useJoinChannel(channelId: string | null) {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !channelId) return;

    const socket = getSocket();
    socket.emit("channel:join", { channelId });

    return () => {
      socket.emit("channel:leave", { channelId });
    };
  }, [channelId, isAuthenticated]);
}
