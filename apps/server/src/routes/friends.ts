import { Router, Request, Response, NextFunction } from "express";
import { friendRequestSchema, friendRequestActionSchema } from "@haven/shared";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import * as friendService from "../services/friend.service.js";

export const friendsRouter = Router();

// Get friends list
friendsRouter.get(
  "/",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const friends = await friendService.getFriends(req.userId!);
      res.json(friends);
    } catch (error) {
      next(error);
    }
  },
);

// Send friend request
friendsRouter.post(
  "/request",
  authenticate,
  validate(friendRequestSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const request = await friendService.sendFriendRequest(req.userId!, req.body.userId);
      res.status(201).json(request);
    } catch (error) {
      next(error);
    }
  },
);

// Accept or reject friend request
friendsRouter.patch(
  "/request/:id",
  authenticate,
  validate(friendRequestActionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await friendService.handleFriendRequest(req.params.id as string, req.userId!, req.body.action);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);

// Remove friend
friendsRouter.delete(
  "/:id",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await friendService.removeFriend(req.userId!, req.params.id as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);
