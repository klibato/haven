import { Router, Request, Response, NextFunction } from "express";
import { updateUserSchema } from "@haven/shared";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import * as userService from "../services/user.service.js";

export const usersRouter = Router();

usersRouter.get(
  "/@me",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await userService.getCurrentUser(req.userId!);
      res.json(user);
    } catch (error) {
      next(error);
    }
  },
);

usersRouter.patch(
  "/@me",
  authenticate,
  validate(updateUserSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await userService.updateUser(req.userId!, req.body);
      res.json(user);
    } catch (error) {
      next(error);
    }
  },
);

usersRouter.get(
  "/:id",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await userService.getUserById(req.params.id as string);
      res.json(user);
    } catch (error) {
      next(error);
    }
  },
);
