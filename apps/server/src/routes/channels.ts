import { Router, Request, Response, NextFunction } from "express";
import { createChannelSchema, updateChannelSchema } from "@haven/shared";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import * as channelService from "../services/channel.service.js";

export const channelsRouter = Router();

// Get channels for a server (mounted at /api/servers/:serverId/channels)
channelsRouter.get(
  "/servers/:serverId/channels",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const channels = await channelService.getServerChannels(req.params.serverId as string, req.userId!);
      res.json(channels);
    } catch (error) {
      next(error);
    }
  },
);

// Create channel in a server
channelsRouter.post(
  "/servers/:serverId/channels",
  authenticate,
  validate(createChannelSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const channel = await channelService.createChannel(req.params.serverId as string, req.userId!, req.body);
      res.status(201).json(channel);
    } catch (error) {
      next(error);
    }
  },
);

// Update a channel
channelsRouter.patch(
  "/channels/:id",
  authenticate,
  validate(updateChannelSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const channel = await channelService.updateChannel(req.params.id as string, req.userId!, req.body);
      res.json(channel);
    } catch (error) {
      next(error);
    }
  },
);

// Delete a channel
channelsRouter.delete(
  "/channels/:id",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await channelService.deleteChannel(req.params.id as string, req.userId!);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);
