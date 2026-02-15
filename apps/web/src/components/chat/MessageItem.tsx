import type { Message } from "@haven/shared";

interface MessageItemProps {
  message: Message;
  isCompact?: boolean;
}

export function MessageItem({ message, isCompact }: MessageItemProps) {
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const displayName = message.author.displayName || message.author.username;

  if (isCompact) {
    return (
      <div className="group flex items-baseline gap-2 px-4 py-0.5 hover:bg-bg-primary/30">
        <span className="text-xs text-text-muted opacity-0 group-hover:opacity-100 w-10 text-right flex-shrink-0">
          {time}
        </span>
        <p className="text-text-normal text-sm">{message.content}</p>
      </div>
    );
  }

  return (
    <div className="group flex gap-4 px-4 py-1 hover:bg-bg-primary/30 mt-3">
      <div className="w-10 h-10 rounded-full bg-accent flex-shrink-0 flex items-center justify-center text-white font-semibold mt-0.5">
        {message.author.avatarUrl ? (
          <img
            src={message.author.avatarUrl}
            alt={displayName}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          displayName[0].toUpperCase()
        )}
      </div>
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-medium text-text-normal hover:underline cursor-pointer">
            {displayName}
          </span>
          <span className="text-xs text-text-muted">{time}</span>
          {message.editedAt && (
            <span className="text-xs text-text-muted">(edited)</span>
          )}
        </div>

        {message.replyTo && (
          <div className="flex items-center gap-1 text-xs text-text-muted mb-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z" />
            </svg>
            <span className="font-medium">
              {message.replyTo.author.displayName || message.replyTo.author.username}
            </span>
            <span className="truncate max-w-xs">{message.replyTo.content}</span>
          </div>
        )}

        <p className="text-text-normal text-sm">{message.content}</p>

        {message.attachments.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-2">
            {message.attachments.map((att) => (
              <a
                key={att.id}
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-link text-sm hover:underline"
              >
                {att.filename}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
