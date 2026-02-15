import { prisma } from "../config/database.js";
import { NotFoundError } from "../utils/errors.js";

const publicUserSelect = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
  status: true,
  customStatus: true,
} as const;

const fullUserSelect = {
  ...publicUserSelect,
  email: true,
  createdAt: true,
} as const;

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: fullUserSelect,
  });
  if (!user) throw new NotFoundError("User");
  return user;
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicUserSelect,
  });
  if (!user) throw new NotFoundError("User");
  return user;
}

export async function updateUser(
  userId: string,
  data: {
    displayName?: string | null;
    avatarUrl?: string | null;
    status?: string;
    customStatus?: string | null;
  },
) {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: fullUserSelect,
  });
  return user;
}
