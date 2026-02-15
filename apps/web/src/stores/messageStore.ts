import { create } from "zustand";
import type { Message } from "@haven/shared";
import * as messagesApi from "@/api/messages.api";

interface MessageState {
  // Messages indexed by channelId
  messagesByChannel: Record<string, Message[]>;
  isLoading: boolean;
  hasMore: Record<string, boolean>;

  loadMessages: (channelId: string) => Promise<void>;
  loadMoreMessages: (channelId: string) => Promise<void>;
  addMessage: (channelId: string, message: Message) => void;
  updateMessage: (message: Message) => void;
  removeMessage: (messageId: string, channelId: string) => void;
  getMessages: (channelId: string) => Message[];
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messagesByChannel: {},
  isLoading: false,
  hasMore: {},

  loadMessages: async (channelId) => {
    set({ isLoading: true });
    try {
      const messages = await messagesApi.getMessages(channelId, { limit: 50 });
      set((state) => ({
        messagesByChannel: {
          ...state.messagesByChannel,
          [channelId]: messages.reverse(), // API returns newest first, we want oldest first
        },
        hasMore: { ...state.hasMore, [channelId]: messages.length === 50 },
        isLoading: false,
      }));
    } catch {
      set({ isLoading: false });
    }
  },

  loadMoreMessages: async (channelId) => {
    const existing = get().messagesByChannel[channelId];
    if (!existing?.length) return;

    const oldestMessage = existing[0];
    const messages = await messagesApi.getMessages(channelId, {
      limit: 50,
      before: oldestMessage.id,
    });

    set((state) => ({
      messagesByChannel: {
        ...state.messagesByChannel,
        [channelId]: [...messages.reverse(), ...(state.messagesByChannel[channelId] || [])],
      },
      hasMore: { ...state.hasMore, [channelId]: messages.length === 50 },
    }));
  },

  addMessage: (channelId, message) =>
    set((state) => ({
      messagesByChannel: {
        ...state.messagesByChannel,
        [channelId]: [...(state.messagesByChannel[channelId] || []), message],
      },
    })),

  updateMessage: (message) =>
    set((state) => ({
      messagesByChannel: {
        ...state.messagesByChannel,
        [message.channelId]: (state.messagesByChannel[message.channelId] || []).map((m) =>
          m.id === message.id ? message : m,
        ),
      },
    })),

  removeMessage: (messageId, channelId) =>
    set((state) => ({
      messagesByChannel: {
        ...state.messagesByChannel,
        [channelId]: (state.messagesByChannel[channelId] || []).filter((m) => m.id !== messageId),
      },
    })),

  getMessages: (channelId) => get().messagesByChannel[channelId] || [],
}));
