export interface User {
  id: string;
  username: string;
  displayName: string | null;
  email: string;
  avatarUrl: string | null;
  status: UserStatus;
  customStatus: string | null;
  createdAt: string;
}

export type UserStatus = "online" | "idle" | "dnd" | "offline";

export interface PublicUser {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  status: UserStatus;
  customStatus: string | null;
}

export interface Server {
  id: string;
  name: string;
  iconUrl: string | null;
  ownerId: string;
  createdAt: string;
}

export interface ServerWithChannels extends Server {
  channels: Channel[];
  memberCount: number;
}

export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  topic: string | null;
  position: number;
  serverId: string;
  categoryId: string | null;
  createdAt: string;
}

export type ChannelType = "TEXT" | "VOICE" | "CATEGORY";

export interface Message {
  id: string;
  content: string;
  authorId: string;
  author: PublicUser;
  channelId: string;
  attachments: Attachment[];
  editedAt: string | null;
  createdAt: string;
  replyToId: string | null;
  replyTo?: Message | null;
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface Member {
  id: string;
  userId: string;
  user: PublicUser;
  serverId: string;
  nickname: string | null;
  joinedAt: string;
  roles: Role[];
}

export interface Role {
  id: string;
  name: string;
  color: string | null;
  permissions: string; // BigInt serialized as string
  position: number;
  serverId: string;
}

export interface Invite {
  id: string;
  code: string;
  serverId: string;
  maxUses: number | null;
  uses: number;
  expiresAt: string | null;
  createdAt: string;
}

export interface InvitePreview {
  code: string;
  server: {
    name: string;
    iconUrl: string | null;
    memberCount: number;
  };
}

export interface DMConversation {
  id: string;
  participants: PublicUser[];
  lastMessage?: DMMessage | null;
  createdAt: string;
}

export interface DMMessage {
  id: string;
  content: string;
  authorId: string;
  conversationId: string;
  createdAt: string;
  editedAt: string | null;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  sender: PublicUser;
  receiverId: string;
  receiver: PublicUser;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface Friendship {
  id: string;
  userId: string;
  user: PublicUser;
  friendId: string;
  friend: PublicUser;
  createdAt: string;
}

// Auth types
export interface AuthTokens {
  token: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Socket event types
export interface SocketEvents {
  // Client → Server
  "message:send": { channelId: string; content: string; replyToId?: string };
  "message:edit": { messageId: string; content: string };
  "message:delete": { messageId: string };
  "typing:start": { channelId: string };
  "typing:stop": { channelId: string };
  "channel:join": { channelId: string };
  "channel:leave": { channelId: string };
  "voice:join": { channelId: string };
  "voice:leave": { channelId: string };
  "voice:mute": { muted: boolean };
  "voice:deafen": { deafened: boolean };
  "presence:update": { status: UserStatus };

  // Server → Client
  "message:new": { message: Message };
  "message:updated": { message: Message };
  "message:deleted": { messageId: string; channelId: string };
  "typing:update": { channelId: string; userId: string; username: string };
  "member:join": { serverId: string; member: Member };
  "member:leave": { serverId: string; userId: string };
  "member:update": { serverId: string; member: Member };
  "presence:updated": { userId: string; status: UserStatus };
  "voice:user_joined": { channelId: string; userId: string };
  "voice:user_left": { channelId: string; userId: string };
  "voice:mute_update": { channelId: string; userId: string; muted: boolean };
  "server:update": { server: Server };
  "channel:create": { channel: Channel };
  "channel:update": { channel: Channel };
  "channel:delete": { channelId: string };
}
