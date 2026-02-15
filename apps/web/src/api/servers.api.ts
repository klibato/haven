import { api } from "./client.js";
import type { Server, ServerWithChannels, Channel, Member } from "@haven/shared";

export async function getServers(): Promise<ServerWithChannels[]> {
  const { data } = await api.get<ServerWithChannels[]>("/servers");
  return data;
}

export async function getServer(id: string): Promise<ServerWithChannels> {
  const { data } = await api.get<ServerWithChannels>(`/servers/${id}`);
  return data;
}

export async function createServer(name: string, iconUrl?: string): Promise<Server> {
  const { data } = await api.post<Server>("/servers", { name, iconUrl });
  return data;
}

export async function updateServer(id: string, updates: { name?: string; iconUrl?: string }): Promise<Server> {
  const { data } = await api.patch<Server>(`/servers/${id}`, updates);
  return data;
}

export async function deleteServer(id: string): Promise<void> {
  await api.delete(`/servers/${id}`);
}

export async function leaveServer(id: string): Promise<void> {
  await api.post(`/servers/${id}/leave`);
}

export async function getServerChannels(serverId: string): Promise<Channel[]> {
  const { data } = await api.get<Channel[]>(`/servers/${serverId}/channels`);
  return data;
}

export async function createChannel(serverId: string, name: string, type: string = "TEXT"): Promise<Channel> {
  const { data } = await api.post<Channel>(`/servers/${serverId}/channels`, { name, type });
  return data;
}

export async function getServerMembers(serverId: string): Promise<Member[]> {
  const { data } = await api.get<Member[]>(`/servers/${serverId}/members`);
  return data;
}

export async function createInvite(serverId: string): Promise<{ code: string }> {
  const { data } = await api.post<{ code: string }>(`/servers/${serverId}/invites`, {});
  return data;
}

export async function joinByInvite(code: string): Promise<Member> {
  const { data } = await api.post<Member>(`/invites/${code}/join`);
  return data;
}
