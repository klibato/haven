import { create } from "zustand";

interface UIState {
  showMemberList: boolean;
  showCreateServerModal: boolean;
  showInviteModal: boolean;
  showJoinServerModal: boolean;

  toggleMemberList: () => void;
  setShowCreateServerModal: (show: boolean) => void;
  setShowInviteModal: (show: boolean) => void;
  setShowJoinServerModal: (show: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  showMemberList: true,
  showCreateServerModal: false,
  showInviteModal: false,
  showJoinServerModal: false,

  toggleMemberList: () => set((state) => ({ showMemberList: !state.showMemberList })),
  setShowCreateServerModal: (show) => set({ showCreateServerModal: show }),
  setShowInviteModal: (show) => set({ showInviteModal: show }),
  setShowJoinServerModal: (show) => set({ showJoinServerModal: show }),
}));
