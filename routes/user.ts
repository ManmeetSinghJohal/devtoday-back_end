import { Router, Request, Response } from "express";
import { validate, ValidationType } from "../middlewares/middleware";
import {
  viewerIdSchema,
  idSchema,
  userGroupQuery,
  userPostsQuery,
  followViewerIdSchema,
} from "../lib/validations";
import { prisma } from "../lib/prisma";
import { StatusCodes } from "http-status-codes";
import { PostType } from "@prisma/client";
import { TypedRequest, TypedRequestParams } from "zod-express-middleware";
import { ZodAny } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const router = Router();

// get all users route
router.get("/", async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      omit: {
        password: true,
      },
      include: {
        profile: true,
      },
    });
    return res.json(users);
  } catch (error) {
    console.error(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
});

// return all users with their profile from the database
router.get("/", async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      omit: {
        password: true,
      },
      include: {
        profile: true,
      },
    });
    return res.json(users);
  } catch (error) {
    console.error(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
});

// return individual user with profile, following & followers count, whether user whose profile is being viewed is follwed by person loged in, and newest three posts
router.get(
  "/:id",
  validate(idSchema, ValidationType.PARAMS),
  validate(viewerIdSchema, ValidationType.QUERY),
  async (
    req: TypedRequest<typeof idSchema, typeof viewerIdSchema, ZodAny>,
    res: Response,
  ) => {
    const id = req.params.id;
    const checkFollowingId = req.query.viewerId;

    try {
      const user = await prisma.user.findUnique({
        where: {
          id,
        },
        omit: {
          password: true,
        },
        include: {
          profile: true,
          posts: {
            orderBy: {
              createdAt: "desc", // Order posts by createdAt in descending order
            },
            take: 3, // Take only the latest three posts
          },
          _count: {
            select: { followers: true, following: true },
          },
          followers: {
            where: {
              followerId: checkFollowingId,
            },
          },
        },
      });

      if (!user) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "No user with that ID found" });
      }

      const followerArray = user?.followers;

      const userIsFollowed = followerArray?.some(
        (item) => item.followerId === checkFollowingId,
      );

      const userCopy = { ...user, userIsFollowed };

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { followers, ...userWithoutFollowers } = userCopy;

      return res.status(StatusCodes.OK).json(userWithoutFollowers);
    } catch (error) {
      console.error(error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

// get all posts of a specific user, filter by postType, with pagination
router.get(
  "/:id/posts",
  validate(idSchema, ValidationType.PARAMS),
  validate(userPostsQuery, ValidationType.QUERY),
  async (
    req: TypedRequest<typeof idSchema, typeof userPostsQuery, ZodAny>,
    res: Response,
  ) => {
    const id = req.params.id;
    const type = req.query.postType;

    const page = req.query.page ? parseInt(req.query.page) : 1;
    const pageSize = 5; // Number of posts per page
    try {
      const skip = (page - 1) * pageSize;
      const userPosts = await prisma.post.findMany({
        where: {
          authorId: id,
          createType: type as PostType,
        },
        include: {
          interestTechTags: {
            select: {
              name: true,
            },
          },
          likes: true,
          comments: true,
        },
        skip: skip,
        take: pageSize,
      });

      return res.status(StatusCodes.OK).json(userPosts);
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

// get all groups a specific user is a part of and the first 4 users with their user image.
router.get(
  "/:id/groups",
  validate(idSchema, ValidationType.PARAMS),
  validate(userGroupQuery, ValidationType.QUERY),
  async (
    req: TypedRequest<typeof idSchema, typeof userGroupQuery, ZodAny>,
    res: Response,
  ) => {
    const id = req.params.id;
    const search = req.query.search; // keep working here to add search functionality
    const pageSize = req.query.size ? Number(req.query.size) : 5;
    const page = req.query.page ? parseInt(req.query.page) : 1;

    try {
      const skip = (page - 1) * pageSize;

      if (!search) {
        const userGroups = await prisma.group.findMany({
          where: {
            groupUser: {
              some: {
                userId: id,
              },
            },
          },
          select: {
            id: true,
            name: true,
            coverImage: true,
            bio: true,
            creator: true,
            groupUser: {
              take: 4,
              include: {
                user: {
                  select: {
                    image: true,
                  },
                },
              },
            },
            _count: {
              select: { groupUser: true },
            },
          },
          skip,
          take: pageSize,
        });
        return res.status(StatusCodes.OK).json(userGroups);
      }

      if (search) {
        const userGroups = await prisma.group.findMany({
          take: pageSize,
          where: {
            OR: [
              {
                name: {
                  contains: search,
                },
              },
              { name: { contains: search } },
            ],
          },
          orderBy: {
            id: "desc",
          },
        });
        return res.status(StatusCodes.OK).json(userGroups);
      }
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

// follow a user
router.post(
  "/:id/follow",
  validate(idSchema, ValidationType.PARAMS),
  validate(followViewerIdSchema, ValidationType.QUERY),
  async (
    req: TypedRequest<typeof idSchema, typeof followViewerIdSchema, ZodAny>,
    res: Response,
  ) => {
    const followerId = req.query.viewerId;
    const followingId = req.params.id;
    try {
      // Check if the user is trying to follow themselves
      if (followerId === followingId) {
        return res
          .status(StatusCodes.CONFLICT)
          .json({ message: "You cannot follow yourself" });
      }

      // Create a new follow relation
      const newFollow = await prisma.follow.create({
        data: {
          follower: { connect: { id: followerId } },
          following: { connect: { id: followingId } },
        },
      });

      return res.status(StatusCodes.OK).json(newFollow);
    } catch (error) {
      console.error(error);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: "One or more Ids do not exist" });
        }
        if (error.code === "P2002") {
          return res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: "You are already following this user" });
        }
      }
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

// unfollow a user
router.post(
  "/:id/unfollow",
  validate(idSchema, ValidationType.PARAMS),
  validate(followViewerIdSchema, ValidationType.QUERY),
  async (
    req: TypedRequest<typeof idSchema, typeof followViewerIdSchema, ZodAny>,
    res: Response,
  ) => {
    const followerId = req.query.viewerId;
    const followingId = req.params.id;
    try {
      // Check if the user is trying to unfollow themselves
      if (followerId === followingId) {
        return res
          .status(StatusCodes.CONFLICT)
          .json({ message: "You cannot unfollow yourself" });
      }

      // delete follow relation
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          },
        },
      });

      return res
        .status(StatusCodes.OK)
        .json({ messsage: "You are now not following this user" });
    } catch (error) {
      console.error(error);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: "You are not following this user" });
        }
      }
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

// delete a specific user
router.delete(
  "/:id",
  validate(idSchema, ValidationType.PARAMS),
  async (req: TypedRequestParams<typeof idSchema>, res: Response) => {
    const id = req.params.id;
    try {
      const user = await prisma.user.delete({
        where: {
          id,
        },
      });

      if (user) {
        res.status(StatusCodes.OK).json({ message: "User deleted" });
      }
    } catch (error) {
      console.error(error);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: "User with this ID does not exist" });
        }
      }
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

export default router;
