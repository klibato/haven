import { Router, Request, Response, NextFunction } from "express";
import { createServerSchema, updateServerSchema } from "@haven/shared";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import * as serverService from "../services/server.service.js";

export const serversRouter = Router();

serversRouter.post(
  "/",
  authenticate,
  validate(createServerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const server = await serverService.createServer(req.body.name, req.userId!, req.body.iconUrl);
      res.status(201).json(server);
    } catch (error) {
      next(error);
    }
  },
);

serversRouter.get(
  "/",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const servers = await serverService.getUserServers(req.userId!);
      res.json(servers);
    } catch (error) {
      next(error);
    }
  },
);

serversRouter.get(
  "/:id",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const server = await serverService.getServerById(req.params.id as string, req.userId!);
      res.json(server);
    } catch (error) {
      next(error);
    }
  },
);

serversRouter.patch(
  "/:id",
  authenticate,
  validate(updateServerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const server = await serverService.updateServer(req.params.id as string, req.userId!, req.body);
      res.json(server);
    } catch (error) {
      next(error);
    }
  },
);

serversRouter.delete(
  "/:id",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await serverService.deleteServer(req.params.id as string, req.userId!);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);

serversRouter.post(
  "/:id/leave",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await serverService.leaveServer(req.params.id as string, req.userId!);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);
