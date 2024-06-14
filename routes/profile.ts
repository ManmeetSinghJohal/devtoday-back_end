import { Router, Response } from "express";

import { prisma } from "../lib/prisma";
import { StatusCodes } from "http-status-codes";
import { validate, ValidationType } from "../middlewares/middleware";
import { onBoardingSchema, idSchema, profileSchema } from "../lib/validations";
import { TypedRequest, TypedRequestBody } from "zod-express-middleware";
import { ZodAny } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const router = Router();

//update user with onboarding information
router.post(
  "/onboarding",
  validate(onBoardingSchema, ValidationType.BODY),
  async (req: TypedRequestBody<typeof onBoardingSchema>, res: Response) => {
    try {
      const { journey, ambitions, tech, id } = req.body;

      // Check if onBoardingCompleted is already true for the user
      const userProfile = await prisma.profile.findUnique({
        where: {
          userId: id,
        },
      });

      if (userProfile && userProfile.onBoardingCompleted) {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: "Onboarding already completed for this user" });
      }

      await prisma.profile.update({
        where: {
          userId: id,
        },
        data: {
          onBoardingCompleted: true,
          journey,
          ambitions,
          tech,
        },
      });
      return res
        .status(StatusCodes.CREATED)
        .json({ message: "Onboarding completed" });
    } catch (error) {
      console.error(error);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: "User to update does not exist" });
        }
      }
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

//update information on a user profile
router.patch(
  "/:id",
  validate(idSchema, ValidationType.PARAMS),
  validate(profileSchema, ValidationType.BODY),
  async (
    req: TypedRequest<typeof idSchema, ZodAny, typeof profileSchema>,
    res: Response,
  ) => {
    const id = req.params.id;
    try {
      const {
        name,
        bio,
        githubLink,
        githubHandle,
        linkedinLink,
        linkedinHandle,
        xProfileLink,
        xProfileHandle,
        instagramLink,
        instagramHandle,
      } = req.body;
      await prisma.profile.update({
        where: {
          userId: id,
        },
        data: {
          name,
          bio,
          githubLink,
          githubHandle,
          linkedinLink,
          linkedinHandle,
          xProfileLink,
          xProfileHandle,
          instagramLink,
          instagramHandle,
        },
      });
      return res.status(StatusCodes.OK).json({ message: "Profile updated" });
    } catch (error) {
      console.error(error);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: "User to update does not exist" });
        }
      }
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

export default router;
