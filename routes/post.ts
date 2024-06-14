import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { StatusCodes } from "http-status-codes";
import {
  idSchema,
  likerIdSchema,
  postSchema,
  updatePostSchema,
} from "../lib/validations";
import { validate, ValidationType } from "../middlewares/middleware";
import {
  TypedRequest,
  TypedRequestBody,
  TypedRequestParams,
} from "zod-express-middleware";
import { ZodAny } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
const router = Router();

//get a specific post with the post's id.
router.get(
  "/:id",
  validate(idSchema, ValidationType.PARAMS),
  async (req: TypedRequestParams<typeof idSchema>, res: Response) => {
    const id = req.params.id;
    try {
      const post = await prisma.post.findUnique({
        where: {
          id,
        },
        include: {
          interestTechTags: {
            select: {
              name: true,
            },
          },
        },
      });
      if (!post) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "No post with that ID found" });
      }
      return res.status(StatusCodes.OK).json(post);
    } catch (error) {
      console.error(error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

//create a post
router.post(
  "/",
  validate(postSchema, ValidationType.BODY),
  async (req: TypedRequestBody<typeof postSchema>, res: Response) => {
    const {
      authorId,
      title,
      createType,
      groupId,
      coverImage,
      audioFile,
      audioTitle,
      meetupLocation,
      meetupDate,
      tinyContent,
      interestTechTags,
    } = req.body;

    try {
      const tagIds = await Promise.all(
        interestTechTags.map(async (tag) => {
          const existingTag = await prisma.tag.findUnique({
            where: {
              name: tag,
            },
            select: {
              id: true,
            },
          });

          if (existingTag !== null) {
            return existingTag.id;
          }

          const createdTag = await prisma.tag.create({
            data: {
              name: tag,
            },
            select: {
              id: true,
            },
          });
          return createdTag.id;
        }),
      );

      const createPost = await prisma.post.create({
        data: {
          authorId,
          title,
          createType,
          groupId,
          coverImage,
          audioFile,
          audioTitle,
          meetupLocation,
          meetupDate,
          tinyContent,
          interestTechTags: {
            connect: tagIds.map((id) => ({ id })),
          },
        },
        include: {
          interestTechTags: {
            select: {
              name: true,
            },
          },
        },
      });
      return res.status(StatusCodes.OK).json(createPost);
    } catch (error) {
      console.error(error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

//edit a post with its id
router.patch(
  "/:id",
  validate(idSchema, ValidationType.PARAMS),
  validate(updatePostSchema, ValidationType.BODY),
  async (
    req: TypedRequest<typeof idSchema, ZodAny, typeof updatePostSchema>,
    res: Response,
  ) => {
    const id = req.params.id;
    const { title, tinyContent } = req.body;
    try {
      const posts = await prisma.post.update({
        where: {
          id,
        },
        data: {
          title,
          tinyContent,
        },
      });
      return res.status(StatusCodes.OK).json(posts);
    } catch (error) {
      console.error(error);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: "Post to update does not exist" });
        }
      }
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

// like a post of another user
router.post(
  "/:id/like",
  validate(idSchema, ValidationType.PARAMS),
  validate(likerIdSchema, ValidationType.BODY),
  async (
    req: TypedRequest<typeof idSchema, ZodAny, typeof likerIdSchema>,
    res: Response,
  ) => {
    const likedPostId = req.params.id;
    const likerId = req.body.likerId;
    try {
      await prisma.post.update({
        where: {
          id: likedPostId,
        },
        data: {
          likes: {
            create: {
              userId: likerId,
            },
          },
        },
      });
      return res
        .status(StatusCodes.OK)
        .json({ message: "You now like this post" });
    } catch (error) {
      console.error(error);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return res
            .status(StatusCodes.CONFLICT)
            .json({ message: "You can't like a post twice" });
        }
        if (error.code === "P2003") {
          return res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: "User with this ID not found" });
        }
        if (error.code === "P2025") {
          return res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: "Post with this ID not found" });
        }
      }
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

//unlike a post of another user
router.post(
  "/:id/unlike",
  validate(idSchema, ValidationType.PARAMS),
  validate(likerIdSchema, ValidationType.BODY),
  async (
    req: TypedRequest<typeof idSchema, ZodAny, typeof likerIdSchema>,
    res: Response,
  ) => {
    const likedPostId = req.params.id;
    const likerId = req.body.likerId;
    try {
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId: likerId,
            postId: likedPostId,
          },
        },
      });
      return res.status(StatusCodes.OK).json({ message: "Unliked this post" });
    } catch (error) {
      console.error(error);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: "Record to delete does not exist" });
        }
      }
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

//delete a single post
router.delete(
  "/:id",
  validate(idSchema, ValidationType.PARAMS),
  async (req: TypedRequestParams<typeof idSchema>, res: Response) => {
    const id = req.params.id;
    try {
      await prisma.post.delete({
        where: {
          id,
        },
      });
      return res.status(StatusCodes.OK).json({ message: "Post deleted" });
    } catch (error) {
      console.error(error);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: "Record to delete does not exist" });
        }
      }
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

export default router;
