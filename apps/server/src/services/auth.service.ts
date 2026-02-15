import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../config/database.js";
import { env } from "../config/env.js";
import { ConflictError, UnauthorizedError } from "../utils/errors.js";
import type { JwtPayload } from "../middleware/auth.js";

function generateTokens(userId: string) {
  const token = jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as string,
  } as jwt.SignOptions);
  const refreshToken = jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as string,
  } as jwt.SignOptions);
  return { token, refreshToken };
}

function sanitizeUser(user: { id: string; username: string; displayName: string | null; email: string; avatarUrl: string | null; status: string; customStatus: string | null; createdAt: Date }) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    email: user.email,
    avatarUrl: user.avatarUrl,
    status: user.status,
    customStatus: user.customStatus,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function register(username: string, email: string, password: string) {
  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
  });

  if (existingUser) {
    if (existingUser.username === username) {
      throw new ConflictError("Username already taken");
    }
    throw new ConflictError("Email already registered");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { username, email, passwordHash, status: "online" },
  });

  const tokens = generateTokens(user.id);
  return { user: sanitizeUser(user), ...tokens };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new UnauthorizedError("Invalid email or password");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { status: "online" },
  });

  const tokens = generateTokens(user.id);
  return { user: sanitizeUser(user), ...tokens };
}

export async function refreshToken(token: string) {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      throw new UnauthorizedError("User not found");
    }
    return generateTokens(user.id);
  } catch {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }
}

export async function logout(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { status: "offline" },
  });
}
