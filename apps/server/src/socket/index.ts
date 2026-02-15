import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../config/database.js";
import { registerMessageHandlers } from "./handlers/message.js";
import { registerTypingHandlers } from "./handlers/typing.js";
import { registerPresenceHandlers } from "./handlers/presence.js";
import { registerChannelHandlers } from "./handlers/channel.js";
import { registerVoiceHandlers } from "./handlers/voice.js";
import type { JwtPayload } from "../middleware/auth.js";

export function setupSocket(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Auth middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, username: true },
      });

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.data.userId = user.id;
      socket.data.username = user.username;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.data.userId as string;

    // Auto-join server rooms for presence broadcasts
    const memberships = await prisma.member.findMany({
      where: { userId },
      select: { serverId: true },
    });

    for (const membership of memberships) {
      socket.join(`server:${membership.serverId}`);
    }

    // Register handlers
    registerMessageHandlers(io, socket);
    registerTypingHandlers(io, socket);
    registerPresenceHandlers(io, socket);
    registerChannelHandlers(socket);
    registerVoiceHandlers(io, socket);
  });

  return io;
}
