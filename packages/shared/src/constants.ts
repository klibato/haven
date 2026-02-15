// Limits
export const MAX_USERNAME_LENGTH = 32;
export const MIN_USERNAME_LENGTH = 2;
export const MAX_PASSWORD_LENGTH = 128;
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_SERVER_NAME_LENGTH = 100;
export const MAX_CHANNEL_NAME_LENGTH = 100;
export const MAX_MESSAGE_LENGTH = 4000;
export const MAX_DISPLAY_NAME_LENGTH = 32;
export const MAX_TOPIC_LENGTH = 1024;
export const MAX_ROLE_NAME_LENGTH = 100;
export const MAX_CUSTOM_STATUS_LENGTH = 128;

// Pagination
export const DEFAULT_MESSAGE_LIMIT = 50;
export const MAX_MESSAGE_LIMIT = 100;

// File uploads
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
export const ALLOWED_FILE_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  "application/pdf",
  "text/plain",
  "application/zip",
  "audio/mpeg",
  "audio/ogg",
  "video/mp4",
  "video/webm",
];

// Invite
export const MAX_INVITE_EXPIRY = 7 * 24 * 60 * 60; // 7 days in seconds
export const DEFAULT_INVITE_EXPIRY = 24 * 60 * 60; // 24 hours in seconds

// Rate limits (requests per window)
export const RATE_LIMITS = {
  auth: { windowMs: 15 * 60 * 1000, max: 10 }, // 10 per 15 min
  messages: { windowMs: 60 * 1000, max: 30 }, // 30 per minute
  general: { windowMs: 60 * 1000, max: 60 }, // 60 per minute
} as const;

// Typing indicator
export const TYPING_TIMEOUT_MS = 5000;

// Presence
export const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
