import { useServerStore } from "@/stores/serverStore";
import { useUIStore } from "@/stores/uiStore";

export function MemberList() {
  const { members } = useServerStore();
  const { showMemberList } = useUIStore();

  if (!showMemberList) return null;

  const onlineMembers = members.filter((m) => m.user.status !== "offline");
  const offlineMembers = members.filter((m) => m.user.status === "offline");

  const statusColors: Record<string, string> = {
    online: "bg-success",
    idle: "bg-warning",
    dnd: "bg-danger",
    offline: "bg-text-muted",
  };

  return (
    <div className="w-60 bg-bg-secondary overflow-y-auto p-3">
      {onlineMembers.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wide px-2 mb-1">
            Online - {onlineMembers.length}
          </h3>
          {onlineMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-bg-primary/30 cursor-pointer"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-semibold">
                  {(member.nickname || member.user.displayName || member.user.username)[0].toUpperCase()}
                </div>
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-bg-secondary ${statusColors[member.user.status]}`}
                />
              </div>
              <span className="text-sm text-text-normal truncate">
                {member.nickname || member.user.displayName || member.user.username}
              </span>
            </div>
          ))}
        </div>
      )}

      {offlineMembers.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wide px-2 mb-1">
            Offline - {offlineMembers.length}
          </h3>
          {offlineMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-bg-primary/30 cursor-pointer opacity-50"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-bg-primary flex items-center justify-center text-text-muted text-xs font-semibold">
                  {(member.nickname || member.user.displayName || member.user.username)[0].toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-bg-secondary bg-text-muted" />
              </div>
              <span className="text-sm text-text-muted truncate">
                {member.nickname || member.user.displayName || member.user.username}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
