import { useServerStore } from "@/stores/serverStore";
import { useUIStore } from "@/stores/uiStore";

export function Sidebar() {
  const { servers, activeServerId, setActiveServer } = useServerStore();
  const { setShowCreateServerModal, setShowJoinServerModal } = useUIStore();

  return (
    <div className="w-[72px] bg-bg-tertiary flex flex-col items-center py-3 gap-2 overflow-y-auto">
      {/* Home / DMs button */}
      <button
        onClick={() => setActiveServer(null)}
        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:rounded-xl ${
          activeServerId === null
            ? "bg-accent rounded-xl text-white"
            : "bg-bg-primary text-text-normal hover:bg-accent hover:text-white"
        }`}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M2.3 7.7L12 2l9.7 5.7v8.6L12 22l-9.7-5.7V7.7z" />
        </svg>
      </button>

      <div className="w-8 h-[2px] bg-bg-primary rounded-full" />

      {/* Server icons */}
      {servers.map((server) => (
        <button
          key={server.id}
          onClick={() => setActiveServer(server.id)}
          title={server.name}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:rounded-xl text-white font-semibold ${
            activeServerId === server.id
              ? "bg-accent rounded-xl"
              : "bg-bg-primary hover:bg-accent"
          }`}
        >
          {server.iconUrl ? (
            <img
              src={server.iconUrl}
              alt={server.name}
              className="w-full h-full rounded-inherit object-cover"
            />
          ) : (
            <span className="text-sm">
              {server.name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </span>
          )}
        </button>
      ))}

      {/* Add server button */}
      <button
        onClick={() => setShowCreateServerModal(true)}
        className="w-12 h-12 rounded-2xl bg-bg-primary text-success hover:bg-success hover:text-white flex items-center justify-center transition-all hover:rounded-xl"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
      </button>

      {/* Join server button */}
      <button
        onClick={() => setShowJoinServerModal(true)}
        className="w-12 h-12 rounded-2xl bg-bg-primary text-success hover:bg-success hover:text-white flex items-center justify-center transition-all hover:rounded-xl"
        title="Join a server"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
        </svg>
      </button>
    </div>
  );
}
