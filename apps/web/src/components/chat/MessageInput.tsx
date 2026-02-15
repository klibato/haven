import { useState, type KeyboardEvent } from "react";
import { useServerStore } from "@/stores/serverStore";
import { getSocket } from "@/lib/socket";

export function MessageInput() {
  const [content, setContent] = useState("");
  const { activeChannelId, getActiveChannel } = useServerStore();
  const channel = getActiveChannel();

  const handleSend = () => {
    if (!content.trim() || !activeChannelId) return;

    const socket = getSocket();
    socket.emit("message:send", {
      channelId: activeChannelId,
      content: content.trim(),
    });

    setContent("");
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = () => {
    if (!activeChannelId) return;
    const socket = getSocket();
    socket.emit("typing:start", { channelId: activeChannelId });
  };

  if (!channel) return null;

  return (
    <div className="px-4 pb-6">
      <div className="bg-bg-tertiary rounded-lg flex items-center px-4">
        <button className="text-text-muted hover:text-text-normal p-1" title="Attach file">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v8M8 12h8" />
          </svg>
        </button>
        <input
          type="text"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            handleTyping();
          }}
          onKeyDown={handleKeyDown}
          placeholder={`Message #${channel.name}`}
          className="flex-1 py-3 px-3 bg-transparent text-text-normal placeholder:text-text-muted outline-none"
        />
        <button
          onClick={handleSend}
          disabled={!content.trim()}
          className="text-text-muted hover:text-text-normal p-1 disabled:opacity-50"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
