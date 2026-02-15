import { useEffect, useRef } from "react";
import { useMessageStore } from "@/stores/messageStore";
import { useServerStore } from "@/stores/serverStore";
import { useJoinChannel } from "@/hooks/useSocket";
import { MessageItem } from "./MessageItem";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export function MessageList() {
  const { activeChannelId, getActiveChannel } = useServerStore();
  const { loadMessages, getMessages, isLoading } = useMessageStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const channel = getActiveChannel();

  useJoinChannel(activeChannelId);

  useEffect(() => {
    if (activeChannelId) {
      loadMessages(activeChannelId);
    }
  }, [activeChannelId]);

  const messages = activeChannelId ? getMessages(activeChannelId) : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (!channel) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-muted">
        <p>Select a channel to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      {/* Channel welcome */}
      <div className="mt-auto px-4 py-4">
        <h2 className="text-3xl font-bold text-text-normal mb-2">
          Welcome to #{channel.name}
        </h2>
        <p className="text-text-muted">
          This is the start of the #{channel.name} channel.
          {channel.topic && ` ${channel.topic}`}
        </p>
      </div>

      {isLoading && (
        <div className="py-4">
          <LoadingSpinner />
        </div>
      )}

      {/* Messages */}
      {messages.map((message, i) => {
        const prevMessage = messages[i - 1];
        const isCompact =
          prevMessage &&
          prevMessage.authorId === message.authorId &&
          new Date(message.createdAt).getTime() -
            new Date(prevMessage.createdAt).getTime() <
            5 * 60 * 1000;

        return (
          <MessageItem
            key={message.id}
            message={message}
            isCompact={isCompact}
          />
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
