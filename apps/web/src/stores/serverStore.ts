import { create } from "zustand";
import type { ServerWithChannels, Channel, Member } from "@haven/shared";
import * as serversApi from "@/api/servers.api";

interface ServerState {
  servers: ServerWithChannels[];
  activeServerId: string | null;
  activeChannelId: string | null;
  members: Member[];

  loadServers: () => Promise<void>;
  setActiveServer: (serverId: string | null) => void;
  setActiveChannel: (channelId: string | null) => void;
  loadMembers: (serverId: string) => Promise<void>;
  addServer: (server: ServerWithChannels) => void;
  removeServer: (serverId: string) => void;
  updateServerChannels: (serverId: string, channels: Channel[]) => void;

  getActiveServer: () => ServerWithChannels | undefined;
  getActiveChannel: () => Channel | undefined;
}

export const useServerStore = create<ServerState>((set, get) => ({
  servers: [],
  activeServerId: null,
  activeChannelId: null,
  members: [],

  loadServers: async () => {
    const servers = await serversApi.getServers();
    set({ servers });
  },

  setActiveServer: (serverId) => {
    set({ activeServerId: serverId, activeChannelId: null, members: [] });
    if (serverId) {
      const server = get().servers.find((s) => s.id === serverId);
      const firstTextChannel = server?.channels.find((c) => c.type === "TEXT");
      if (firstTextChannel) {
        set({ activeChannelId: firstTextChannel.id });
      }
      get().loadMembers(serverId);
    }
  },

  setActiveChannel: (channelId) => set({ activeChannelId: channelId }),

  loadMembers: async (serverId) => {
    const members = await serversApi.getServerMembers(serverId);
    set({ members });
  },

  addServer: (server) => set((state) => ({ servers: [...state.servers, server] })),

  removeServer: (serverId) =>
    set((state) => ({
      servers: state.servers.filter((s) => s.id !== serverId),
      activeServerId: state.activeServerId === serverId ? null : state.activeServerId,
    })),

  updateServerChannels: (serverId, channels) =>
    set((state) => ({
      servers: state.servers.map((s) =>
        s.id === serverId ? { ...s, channels } : s,
      ),
    })),

  getActiveServer: () => {
    const { servers, activeServerId } = get();
    return servers.find((s) => s.id === activeServerId);
  },

  getActiveChannel: () => {
    const server = get().getActiveServer();
    const { activeChannelId } = get();
    return server?.channels.find((c) => c.id === activeChannelId);
  },
}));
