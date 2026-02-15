import { api } from "./client.js";
import type { User, PublicUser } from "@haven/shared";

export async function getCurrentUser(): Promise<User> {
  const { data } = await api.get<User>("/users/@me");
  return data;
}

export async function updateCurrentUser(updates: {
  displayName?: string | null;
  status?: string;
  customStatus?: string | null;
}): Promise<User> {
  const { data } = await api.patch<User>("/users/@me", updates);
  return data;
}

export async function getUser(id: string): Promise<PublicUser> {
  const { data } = await api.get<PublicUser>(`/users/${id}`);
  return data;
}
