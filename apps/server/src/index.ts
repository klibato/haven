import { createServer } from "http";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { prisma } from "./config/database.js";
import { setupSocket } from "./socket/index.js";
import { generalLimiter } from "./middleware/rateLimit.js";
import { AppError } from "./utils/errors.js";

// Routes
import { authRouter } from "./routes/auth.js";
import { usersRouter } from "./routes/users.js";
import { serversRouter } from "./routes/servers.js";
import { channelsRouter } from "./routes/channels.js";
import { messagesRouter } from "./routes/messages.js";
import { membersRouter } from "./routes/members.js";
import { invitesRouter } from "./routes/invites.js";
import { dmsRouter } from "./routes/dms.js";
import { friendsRouter } from "./routes/friends.js";

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(generalLimiter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/servers", serversRouter);
app.use("/api", channelsRouter);
app.use("/api", messagesRouter);
app.use("/api", membersRouter);
app.use("/api", invitesRouter);
app.use("/api/dms", dmsRouter);
app.use("/api/friends", friendsRouter);

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Socket.IO
setupSocket(httpServer);

// Start
async function start() {
  try {
    await prisma.$connect();
    console.log("Connected to database");

    httpServer.listen(env.PORT, () => {
      console.log(`Haven server running on port ${env.PORT}`);
      console.log(`Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down...");
  await prisma.$disconnect();
  httpServer.close();
  process.exit(0);
});
