import { Router, Request, Response, NextFunction } from "express";
import { registerSchema, loginSchema, refreshTokenSchema } from "@haven/shared";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimit.js";
import * as authService from "../services/auth.service.js";

export const authRouter = Router();

authRouter.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.register(req.body.username, req.body.email, req.body.password);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },
);

authRouter.post(
  "/login",
  authLimiter,
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login(req.body.email, req.body.password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

authRouter.post(
  "/refresh",
  validate(refreshTokenSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.refreshToken(req.body.refreshToken);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

authRouter.post(
  "/logout",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authService.logout(req.userId!);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);
