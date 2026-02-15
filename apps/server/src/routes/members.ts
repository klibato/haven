import { Router, Request, Response, NextFunction } from "express";
import { updateMemberSchema, createRoleSchema, updateRoleSchema } from "@haven/shared";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import * as memberService from "../services/member.service.js";

export const membersRouter = Router();

// Get server members
membersRouter.get(
  "/servers/:serverId/members",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const members = await memberService.getServerMembers(req.params.serverId as string, req.userId!);
      res.json(members);
    } catch (error) {
      next(error);
    }
  },
);

// Update a member
membersRouter.patch(
  "/servers/:serverId/members/:userId",
  authenticate,
  validate(updateMemberSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const member = await memberService.updateMember(
        req.params.serverId as string,
        req.params.userId as string,
        req.userId!,
        req.body,
      );
      res.json(member);
    } catch (error) {
      next(error);
    }
  },
);

// Kick a member
membersRouter.delete(
  "/servers/:serverId/members/:userId",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await memberService.kickMember(req.params.serverId as string, req.params.userId as string, req.userId!);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);

// Create a role
membersRouter.post(
  "/servers/:serverId/roles",
  authenticate,
  validate(createRoleSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const role = await memberService.createRole(req.params.serverId as string, req.userId!, req.body);
      // Serialize BigInt as string
      res.status(201).json({
        ...role,
        permissions: role.permissions.toString(),
      });
    } catch (error) {
      next(error);
    }
  },
);

// Update a role
membersRouter.patch(
  "/roles/:id",
  authenticate,
  validate(updateRoleSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const role = await memberService.updateRole(req.params.id as string, req.userId!, req.body);
      res.json({
        ...role,
        permissions: role.permissions.toString(),
      });
    } catch (error) {
      next(error);
    }
  },
);

// Delete a role
membersRouter.delete(
  "/roles/:id",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await memberService.deleteRole(req.params.id as string, req.userId!);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);
