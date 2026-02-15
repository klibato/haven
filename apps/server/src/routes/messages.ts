import { Router, Request, Response, NextFunction } from "express";
import { createMessageSchema, updateMessageSchema, paginationSchema } from "@haven/shared";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import { messageLimiter } from "../middleware/rateLimit.js";
import * as messageService from "../services/message.service.js";

export const messagesRouter = Router();

// Get messages in a channel
messagesRouter.get(
  "/channels/:channelId/messages",
  authenticate,
  validate(paginationSchema, "query"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const messages = await messageService.getMessages(req.params.channelId as string, req.userId!, {
        limit: Number(req.query.limit) || 50,
        before: req.query.before as string | undefined,
      });
      res.json(messages);
    } catch (error) {
      next(error);
    }
  },
);

// Create a message
messagesRouter.post(
  "/channels/:channelId/messages",
  authenticate,
  messageLimiter,
  validate(createMessageSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const message = await messageService.createMessage(req.params.channelId as string, req.userId!, req.body);
      res.status(201).json(message);
    } catch (error) {
      next(error);
    }
  },
);

// Edit a message
messagesRouter.patch(
  "/messages/:id",
  authenticate,
  validate(updateMessageSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const message = await messageService.updateMessage(req.params.id as string, req.userId!, req.body.content);
      res.json(message);
    } catch (error) {
      next(error);
    }
  },
);

// Delete a message
messagesRouter.delete(
  "/messages/:id",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await messageService.deleteMessage(req.params.id as string, req.userId!);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);
