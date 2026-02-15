import { Router, Request, Response, NextFunction } from "express";
import { createDMSchema, createDMMessageSchema, paginationSchema } from "@haven/shared";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import * as dmService from "../services/dm.service.js";

export const dmsRouter = Router();

// Get DM conversations
dmsRouter.get(
  "/",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const conversations = await dmService.getDMConversations(req.userId!);
      res.json(conversations);
    } catch (error) {
      next(error);
    }
  },
);

// Create DM conversation
dmsRouter.post(
  "/",
  authenticate,
  validate(createDMSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const conversation = await dmService.createDMConversation(req.userId!, req.body.recipientId);
      res.status(201).json(conversation);
    } catch (error) {
      next(error);
    }
  },
);

// Get DM messages
dmsRouter.get(
  "/:id/messages",
  authenticate,
  validate(paginationSchema, "query"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const messages = await dmService.getDMMessages(req.params.id as string, req.userId!, {
        limit: Number(req.query.limit) || 50,
        before: req.query.before as string | undefined,
      });
      res.json(messages);
    } catch (error) {
      next(error);
    }
  },
);

// Send DM message
dmsRouter.post(
  "/:id/messages",
  authenticate,
  validate(createDMMessageSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const message = await dmService.createDMMessage(req.params.id as string, req.userId!, req.body.content);
      res.status(201).json(message);
    } catch (error) {
      next(error);
    }
  },
);
