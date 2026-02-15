import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useServerStore } from "@/stores/serverStore";
import { useSocket } from "@/hooks/useSocket";
import { Sidebar } from "./Sidebar";
import { ChannelList } from "./ChannelList";
import { MemberList } from "./MemberList";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { CreateServerModal } from "@/components/server/CreateServerModal";
import { InviteModal } from "@/components/server/InviteModal";
import { JoinServerModal } from "@/components/server/JoinServerModal";

export function MainLayout() {
  const { loadUser } = useAuthStore();
  const { loadServers, activeServerId } = useServerStore();

  useSocket();

  useEffect(() => {
    loadUser();
    loadServers();
  }, []);

  return (
    <div className="flex h-screen w-screen">
      <Sidebar />
      <ChannelList />

      {/* Main content area */}
      <div className="flex-1 flex flex-col bg-bg-primary min-w-0">
        {/* Channel header */}
        <div className="h-12 px-4 flex items-center border-b border-bg-tertiary shadow-sm">
          <ChannelHeader />
        </div>

        <div className="flex-1 flex min-h-0">
          <div className="flex-1 flex flex-col min-w-0">
            <MessageList />
            <MessageInput />
          </div>

          {activeServerId && <MemberList />}
        </div>
      </div>

      {/* Modals */}
      <CreateServerModal />
      <InviteModal />
      <JoinServerModal />
    </div>
  );
}

function ChannelHeader() {
  const { getActiveChannel } = useServerStore();
  const channel = getActiveChannel();

  if (!channel) {
    return <span className="text-text-muted">Select a channel</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-text-muted text-xl">#</span>
      <span className="font-semibold text-text-normal">{channel.name}</span>
      {channel.topic && (
        <>
          <div className="w-px h-6 bg-bg-tertiary mx-2" />
          <span className="text-sm text-text-muted truncate">{channel.topic}</span>
        </>
      )}
    </div>
  );
}
