import { Router, Response } from "express";
import { validate, ValidationType } from "../middlewares/middleware";
import { prisma } from "../lib/prisma";
import { StatusCodes } from "http-status-codes";
import {
  TypedRequest,
  TypedRequestBody,
  TypedRequestParams,
} from "zod-express-middleware";
import { ZodAny } from "zod";

import {
  editGroupSchema,
  groupSchema,
  adminUserSchema,
  idSchema,
  groupMembersQuery,
  joinGroupSchema,
  removeMemberSchema,
  leaveGroupSchema,
} from "../lib/validations";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const router = Router();

router.post(
  "/create",
  validate(groupSchema, ValidationType.BODY),
  async (req: TypedRequestBody<typeof groupSchema>, res: Response) => {
    const { name, bio, profileImage, coverImage, creatorId, members } =
      req.body;
    try {
      const group = await prisma.group.create({
        data: {
          name: name.toLowerCase(),
          bio: bio.toLowerCase(),
          profileImage: profileImage || "",
          coverImage,
          creatorId,
          groupUser: {
            create: [
              {
                userId: creatorId,
                isAdmin: true,
              },
              ...members,
            ],
          },
        },
      });

      return res.status(StatusCodes.OK).json(group);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return res
            .status(StatusCodes.CONFLICT)
            .json({ message: "Group already exists" });
        }
      }
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

// GET GROUP INFO
router.get(
  "/:id",
  validate(idSchema, ValidationType.PARAMS),
  async (req: TypedRequestParams<typeof idSchema>, res: Response) => {
    const id = req.params.id;
    try {
      const group = await prisma.group.findUnique({
        where: { id },
        include: {
          creator: true,
          groupUser: true,
        },
      });
      if (group) {
        return res.status(StatusCodes.OK).json(group);
      }
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Group not found" });
    } catch (error) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal Server Error" });
    }
  },
);

router.get(
  "/:id/admins",
  validate(idSchema, ValidationType.PARAMS),
  validate(groupMembersQuery, ValidationType.QUERY),
  async (
    req: TypedRequest<typeof idSchema, typeof groupMembersQuery, ZodAny>,
    res: Response,
  ) => {
    const groupId = req.params.id;
    const pageSize = 10;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    try {
      const skip = (page - 1) * pageSize;
      const members = await prisma.groupUser.findMany({
        where: { groupId },
        include: {
          user: {
            select: {
              id: true,
              image: true,
              profile: true,
            },
          },
        },
        skip,
        take: pageSize,
      });

      if (members) {
        return res.status(StatusCodes.OK).json(members);
      }
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "No members yet" });
    } catch (error) {
      console.error(error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal Server Error" });
    }
  },
);

// ADD ADMINS, GROUP MEMBERS will become admins
router.patch(
  "/:id/add-admin",
  validate(idSchema, ValidationType.PARAMS),
  validate(adminUserSchema, ValidationType.BODY),
  async (
    req: TypedRequest<typeof idSchema, ZodAny, typeof adminUserSchema>,
    res: Response,
  ) => {
    const groupId = req.params.id;
    const { memberId, creatorId } = req.body;
    try {
      const group = await prisma.group.findUnique({
        where: { id: groupId },
      });

      if (group?.creatorId !== creatorId) {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: "You are not allowed to add admins" });
      }

      const groupUser = await prisma.groupUser.update({
        where: { userId_groupId: { userId: memberId, groupId } },
        data: { isAdmin: true },
      });

      if (!groupUser) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "User wasn't found" });
      }
      return res.status(StatusCodes.OK).json({ user: groupUser });
    } catch (error) {
      console.error(error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

// REMOVE ADMIN
router.patch(
  "/:id/remove-admin",
  validate(idSchema, ValidationType.PARAMS),
  validate(adminUserSchema, ValidationType.BODY),
  async (
    req: TypedRequest<typeof idSchema, ZodAny, typeof adminUserSchema>,
    res: Response,
  ) => {
    const groupId = req.params.id;
    const { memberId, creatorId } = req.body;
    try {
      const group = await prisma.group.findUnique({
        where: { id: groupId },
      });

      if (group?.creatorId !== creatorId) {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: "You are not allowed to remove admins" });
      }

      const groupUser = await prisma.groupUser.update({
        where: { userId_groupId: { userId: memberId, groupId } },
        data: { isAdmin: false },
      });

      if (!groupUser) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "User wasn't found" });
      }
      return res.status(StatusCodes.OK).json({ user: groupUser });
    } catch (error) {
      console.error(error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

// EDIT GROUP
router.patch(
  "/:id",
  validate(idSchema, ValidationType.PARAMS),
  validate(editGroupSchema, ValidationType.BODY),
  async (
    req: TypedRequest<typeof idSchema, ZodAny, typeof editGroupSchema>,
    res: Response,
  ) => {
    const groupId = req.params.id;
    const { name, bio, profileImage, coverImage, userId } = req.body;
    try {
      const group = await prisma.group.findUnique({
        where: { id: groupId },
      });

      if (group?.creatorId !== userId) {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: "You are not allowed to edit the group" });
      }
      const groupUpdate = await prisma.group.update({
        where: { id: groupId },
        data: {
          name,
          bio,
          profileImage,
          coverImage,
        },
      });
      if (groupUpdate) {
        return res.status(StatusCodes.OK).json(groupUpdate);
      }
    } catch (error) {
      console.log(error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal Server Error" });
    }
  },
);

//JOIN GROUP
router.post(
  "/:id/join",
  validate(idSchema, ValidationType.PARAMS),
  validate(joinGroupSchema, ValidationType.BODY),
  async (
    req: TypedRequest<typeof idSchema, ZodAny, typeof joinGroupSchema>,
    res: Response,
  ) => {
    const groupId = req.params.id;
    const userId = req.body.userId;

    try {
      const newMember = await prisma.groupUser.create({
        data: {
          userId: userId,
          groupId: groupId,
        },
      });
      console.log(newMember);
      return res.status(StatusCodes.OK).json({ message: "You joined group" });
    } catch (error) {
      console.log(error);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return res
            .status(StatusCodes.CONFLICT)
            .json({ message: "User already in group" });
        }
      }
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

// LEAVE GROUP
router.delete(
  "/:id/leave",
  validate(idSchema, ValidationType.PARAMS),
  validate(leaveGroupSchema, ValidationType.BODY),
  async (
    req: TypedRequest<typeof idSchema, ZodAny, typeof leaveGroupSchema>,
    res: Response,
  ) => {
    const groupId = req.params.id;
    const userId = req.body.userId;
    try {
      await prisma.groupUser.delete({
        where: {
          userId_groupId: {
            groupId: groupId,
            userId: userId,
          },
        },
      });

      return res.status(StatusCodes.OK).json({ message: "You left the group" });
    } catch (error) {
      console.error(error);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: "Not in the group" });
        }
      }
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

// REMOVE USER
router.delete(
  "/:id/remove",
  validate(idSchema, ValidationType.PARAMS),
  validate(removeMemberSchema, ValidationType.BODY),
  async (
    req: TypedRequest<typeof idSchema, ZodAny, typeof removeMemberSchema>,
    res: Response,
  ) => {
    const groupId = req.params.id;
    const memberId = req.body.memberId;
    const adminId = req.body.adminId;
    try {
      const group = await prisma.group.findUnique({
        where: { id: groupId },
      });

      if (group?.creatorId !== adminId) {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: "You are not allowed to remove members" });
      }

      await prisma.groupUser.delete({
        where: {
          userId_groupId: {
            groupId: groupId,
            userId: memberId,
          },
        },
      });

      return res.status(StatusCodes.OK).json({ message: "User removed" });
    } catch (error) {
      console.error(error);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: "User not in the group" });
        }
      }
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

// DELETE GROUP
router.delete(
  "/:id",
  validate(idSchema, ValidationType.PARAMS),
  validate(idSchema, ValidationType.BODY),
  async (
    req: TypedRequest<typeof idSchema, ZodAny, typeof idSchema>,
    res: Response,
  ) => {
    const groupId = req.params.id;
    const creatorId = req.body.id;
    try {
      const group = await prisma.group.findUnique({
        where: { id: groupId },
      });

      if (!group) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "Group does not exist" });
      }
      if (group.creatorId === creatorId) {
        const groupDeleted = await prisma.group.delete({
          where: { id: groupId },
        });
        console.log("This group was deleted", groupDeleted);
      } else {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: "Not Allowed" });
      }
      return res.status(StatusCodes.OK).json(group);
    } catch (error) {
      console.error(error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

export default router;
