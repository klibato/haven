import { prisma } from "../config/database.js";
import { NotFoundError, ConflictError, AppError } from "../utils/errors.js";

const publicUserSelect = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
  status: true,
  customStatus: true,
} as const;

export async function getFriends(userId: string) {
  const friendships = await prisma.friendship.findMany({
    where: { userId },
    include: { friend: { select: publicUserSelect } },
  });
  return friendships.map((f) => ({
    id: f.id,
    friend: f.friend,
    createdAt: f.createdAt.toISOString(),
  }));
}

export async function sendFriendRequest(senderId: string, receiverId: string) {
  if (senderId === receiverId) {
    throw new AppError(400, "You cannot send a friend request to yourself");
  }

  const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
  if (!receiver) throw new NotFoundError("User");

  // Check existing
  const existing = await prisma.friendRequest.findFirst({
    where: {
      OR: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    },
  });
  if (existing) throw new ConflictError("Friend request already exists");

  // Check already friends
  const friendship = await prisma.friendship.findUnique({
    where: { userId_friendId: { userId: senderId, friendId: receiverId } },
  });
  if (friendship) throw new ConflictError("Already friends");

  return prisma.friendRequest.create({
    data: { senderId, receiverId },
    include: {
      sender: { select: publicUserSelect },
      receiver: { select: publicUserSelect },
    },
  });
}

export async function handleFriendRequest(
  requestId: string,
  userId: string,
  action: "accept" | "reject",
) {
  const request = await prisma.friendRequest.findUnique({
    where: { id: requestId },
  });
  if (!request) throw new NotFoundError("Friend request");
  if (request.receiverId !== userId) {
    throw new AppError(403, "You can only respond to friend requests sent to you");
  }
  if (request.status !== "pending") {
    throw new AppError(400, "This friend request has already been handled");
  }

  if (action === "accept") {
    await prisma.$transaction([
      prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: "accepted" },
      }),
      // Create bidirectional friendship
      prisma.friendship.create({
        data: { userId: request.senderId, friendId: request.receiverId },
      }),
      prisma.friendship.create({
        data: { userId: request.receiverId, friendId: request.senderId },
      }),
    ]);
  } else {
    await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: "rejected" },
    });
  }
}

export async function removeFriend(userId: string, friendId: string) {
  await prisma.$transaction([
    prisma.friendship.deleteMany({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    }),
    prisma.friendRequest.deleteMany({
      where: {
        OR: [
          { senderId: userId, receiverId: friendId },
          { senderId: friendId, receiverId: userId },
        ],
      },
    }),
  ]);
}
