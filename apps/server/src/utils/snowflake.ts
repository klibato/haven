// Simple ID generation using cuid (via Prisma @default(cuid()))
// This module provides utility helpers for ID-related operations.

import { createId } from "@paralleldrive/cuid2";

export { createId };

export function generateInviteCode(): string {
  // Generate a short, readable invite code
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
