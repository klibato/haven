import { Router, Request, Response, NextFunction } from "express";
import { createInviteSchema } from "@haven/shared";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import * as inviteService from "../services/invite.service.js";

export const invitesRouter = Router();

// Create an invite for a server
invitesRouter.post(
  "/servers/:serverId/invites",
  authenticate,
  validate(createInviteSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const invite = await inviteService.createInvite(req.params.serverId as string, req.userId!, req.body);
      res.status(201).json(invite);
    } catch (error) {
      next(error);
    }
  },
);

// Get invite preview (public)
invitesRouter.get(
  "/invites/:code",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const preview = await inviteService.getInvitePreview(req.params.code as string);
      res.json(preview);
    } catch (error) {
      next(error);
    }
  },
);

// Join a server via invite
invitesRouter.post(
  "/invites/:code/join",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const member = await inviteService.joinServer(req.params.code as string, req.userId!);
      res.status(201).json(member);
    } catch (error) {
      next(error);
    }
  },
);
