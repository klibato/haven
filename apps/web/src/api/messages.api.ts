import { api } from "./client.js";
import type { Message } from "@haven/shared";

export async function getMessages(
  channelId: string,
  options?: { limit?: number; before?: string },
): Promise<Message[]> {
  const params = new URLSearchParams();
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.before) params.set("before", options.before);

  const { data } = await api.get<Message[]>(`/channels/${channelId}/messages?${params}`);
  return data;
}

export async function sendMessage(
  channelId: string,
  content: string,
  replyToId?: string,
): Promise<Message> {
  const { data } = await api.post<Message>(`/channels/${channelId}/messages`, {
    content,
    replyToId,
  });
  return data;
}

export async function editMessage(messageId: string, content: string): Promise<Message> {
  const { data } = await api.patch<Message>(`/messages/${messageId}`, { content });
  return data;
}

export async function deleteMessage(messageId: string): Promise<void> {
  await api.delete(`/messages/${messageId}`);
}
