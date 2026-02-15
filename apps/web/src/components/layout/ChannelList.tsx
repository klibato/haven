import { useServerStore } from "@/stores/serverStore";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";

export function ChannelList() {
  const { getActiveServer, activeChannelId, setActiveChannel } = useServerStore();
  const { user, logout } = useAuthStore();
  const { setShowInviteModal } = useUIStore();
  const server = getActiveServer();

  if (!server) {
    return (
      <div className="w-60 bg-bg-secondary flex flex-col">
        <div className="h-12 px-4 flex items-center border-b border-bg-tertiary shadow-sm">
          <span className="font-semibold text-text-normal">Direct Messages</span>
        </div>
        <div className="flex-1 p-2">
          <p className="text-text-muted text-sm p-2">No DMs yet</p>
        </div>
        <UserPanel user={user} onLogout={logout} />
      </div>
    );
  }

  const textChannels = server.channels.filter((c) => c.type === "TEXT");
  const voiceChannels = server.channels.filter((c) => c.type === "VOICE");

  return (
    <div className="w-60 bg-bg-secondary flex flex-col">
      {/* Server header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-bg-tertiary shadow-sm">
        <span className="font-semibold text-text-normal truncate">{server.name}</span>
        <button
          onClick={() => setShowInviteModal(true)}
          className="text-text-muted hover:text-text-normal"
          title="Invite people"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8M19 8v6M22 11h-6" />
          </svg>
        </button>
      </div>

      {/* Channel list */}
      <div className="flex-1 overflow-y-auto p-2">
        {textChannels.length > 0 && (
          <div className="mb-2">
            <div className="flex items-center px-1 py-1">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wide">
                Text Channels
              </span>
            </div>
            {textChannels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setActiveChannel(channel.id)}
                className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-sm transition-colors ${
                  activeChannelId === channel.id
                    ? "bg-bg-primary/50 text-text-normal"
                    : "text-text-muted hover:text-text-normal hover:bg-bg-primary/30"
                }`}
              >
                <span className="text-lg opacity-60">#</span>
                <span className="truncate">{channel.name}</span>
              </button>
            ))}
          </div>
        )}

        {voiceChannels.length > 0 && (
          <div className="mb-2">
            <div className="flex items-center px-1 py-1">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wide">
                Voice Channels
              </span>
            </div>
            {voiceChannels.map((channel) => (
              <button
                key={channel.id}
                className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-sm text-text-muted hover:text-text-normal hover:bg-bg-primary/30 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="opacity-60">
                  <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                </svg>
                <span className="truncate">{channel.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <UserPanel user={user} onLogout={logout} />
    </div>
  );
}

function UserPanel({
  user,
  onLogout,
}: {
  user: { username: string; status: string; displayName?: string | null } | null;
  onLogout: () => void;
}) {
  if (!user) return null;

  const statusColors: Record<string, string> = {
    online: "bg-success",
    idle: "bg-warning",
    dnd: "bg-danger",
    offline: "bg-text-muted",
  };

  return (
    <div className="h-14 bg-bg-tertiary/50 px-2 flex items-center gap-2">
      <div className="relative">
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-sm font-semibold">
          {user.username[0].toUpperCase()}
        </div>
        <div
          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-bg-tertiary ${statusColors[user.status] || statusColors.offline}`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-text-normal truncate">
          {user.displayName || user.username}
        </div>
        <div className="text-xs text-text-muted">Online</div>
      </div>
      <button
        onClick={onLogout}
        className="text-text-muted hover:text-text-normal p-1"
        title="Log out"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
        </svg>
      </button>
    </div>
  );
}
