import { z } from "zod";

// Auth
export const registerSchema = z.object({
  username: z
    .string()
    .min(2, "Username must be at least 2 characters")
    .max(32, "Username must be at most 32 characters")
    .regex(/^[a-zA-Z0-9_.-]+$/, "Username can only contain letters, numbers, underscores, dots, and hyphens"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

// User
export const updateUserSchema = z.object({
  displayName: z.string().max(32).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  status: z.enum(["online", "idle", "dnd", "offline"]).optional(),
  customStatus: z.string().max(128).nullable().optional(),
});

// Server
export const createServerSchema = z.object({
  name: z
    .string()
    .min(1, "Server name is required")
    .max(100, "Server name must be at most 100 characters"),
  iconUrl: z.string().url().nullable().optional(),
});

export const updateServerSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  iconUrl: z.string().url().nullable().optional(),
});

// Channel
export const createChannelSchema = z.object({
  name: z
    .string()
    .min(1, "Channel name is required")
    .max(100, "Channel name must be at most 100 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Channel name can only contain letters, numbers, underscores, and hyphens"),
  type: z.enum(["TEXT", "VOICE", "CATEGORY"]).default("TEXT"),
  topic: z.string().max(1024).nullable().optional(),
  categoryId: z.string().nullable().optional(),
});

export const updateChannelSchema = z.object({
  name: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/).optional(),
  topic: z.string().max(1024).nullable().optional(),
  position: z.number().int().min(0).optional(),
});

// Message
export const createMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Message content is required")
    .max(4000, "Message must be at most 4000 characters"),
  replyToId: z.string().nullable().optional(),
});

export const updateMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Message content is required")
    .max(4000, "Message must be at most 4000 characters"),
});

// Member
export const updateMemberSchema = z.object({
  nickname: z.string().max(32).nullable().optional(),
  roleIds: z.array(z.string()).optional(),
});

// Role
export const createRoleSchema = z.object({
  name: z
    .string()
    .min(1, "Role name is required")
    .max(100, "Role name must be at most 100 characters"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color")
    .nullable()
    .optional(),
  permissions: z.string().default("0"), // BigInt as string
});

export const updateRoleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional(),
  permissions: z.string().optional(),
});

// Invite
export const createInviteSchema = z.object({
  maxUses: z.number().int().min(1).nullable().optional(),
  expiresIn: z.number().int().min(60).max(604800).nullable().optional(), // seconds, 1 min to 7 days
});

// DM
export const createDMSchema = z.object({
  recipientId: z.string().min(1, "Recipient ID is required"),
});

export const createDMMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Message content is required")
    .max(4000, "Message must be at most 4000 characters"),
});

// Friend
export const friendRequestSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

export const friendRequestActionSchema = z.object({
  action: z.enum(["accept", "reject"]),
});

// Pagination
export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  before: z.string().optional(),
});
