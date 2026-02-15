export const Permissions = {
  ADMINISTRATOR: 1n << 0n,
  MANAGE_SERVER: 1n << 1n,
  MANAGE_CHANNELS: 1n << 2n,
  MANAGE_ROLES: 1n << 3n,
  KICK_MEMBERS: 1n << 4n,
  BAN_MEMBERS: 1n << 5n,
  CREATE_INVITE: 1n << 6n,
  SEND_MESSAGES: 1n << 7n,
  READ_MESSAGES: 1n << 8n,
  MANAGE_MESSAGES: 1n << 9n,
  ATTACH_FILES: 1n << 10n,
  READ_MESSAGE_HISTORY: 1n << 11n,
  MENTION_EVERYONE: 1n << 12n,
  ADD_REACTIONS: 1n << 13n,
  CONNECT_VOICE: 1n << 14n,
  SPEAK: 1n << 15n,
  MUTE_MEMBERS: 1n << 16n,
  DEAFEN_MEMBERS: 1n << 17n,
  MOVE_MEMBERS: 1n << 18n,
} as const;

export const DEFAULT_PERMISSIONS =
  Permissions.READ_MESSAGES |
  Permissions.SEND_MESSAGES |
  Permissions.READ_MESSAGE_HISTORY |
  Permissions.CREATE_INVITE |
  Permissions.ATTACH_FILES |
  Permissions.ADD_REACTIONS |
  Permissions.CONNECT_VOICE |
  Permissions.SPEAK;

export type PermissionKey = keyof typeof Permissions;

export function hasPermission(userPermissions: bigint, permission: bigint): boolean {
  if ((userPermissions & Permissions.ADMINISTRATOR) === Permissions.ADMINISTRATOR) {
    return true;
  }
  return (userPermissions & permission) === permission;
}

export function combinePermissions(...permissions: bigint[]): bigint {
  return permissions.reduce((acc, p) => acc | p, 0n);
}

export function removePermission(userPermissions: bigint, permission: bigint): bigint {
  return userPermissions & ~permission;
}
