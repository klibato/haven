import { api } from "./client.js";
import type { LoginResponse, RegisterResponse } from "@haven/shared";

export async function register(username: string, email: string, password: string): Promise<RegisterResponse> {
  const { data } = await api.post<RegisterResponse>("/auth/register", { username, email, password });
  return data;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", { email, password });
  return data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}
