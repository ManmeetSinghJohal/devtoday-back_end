import { Router, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import { validate, ValidationType } from "../middlewares/middleware";
import { StatusCodes } from "http-status-codes";
import {
  emailSchema,
  userLoginSchema,
  userRegisterSchema,
} from "../lib/validations";
import { TypedRequestBody } from "zod-express-middleware";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const router = Router();
const saltRounds = 10;
const saltRoundsRandom = bcrypt.genSaltSync(saltRounds);

//register a new user
router.post(
  "/register",
  validate(userRegisterSchema, ValidationType.BODY),
  async (req: TypedRequestBody<typeof userRegisterSchema>, res: Response) => {
    const { username, email, password } = req.body;
    try {
      const hashedPassword = bcrypt.hashSync(password, saltRoundsRandom);
      await prisma.user.create({
        data: {
          username,
          email: email.toLowerCase(),
          password: hashedPassword,
          profile: {
            create: {
              onBoardingCompleted: false,
            },
          },
        },
      });
      res
        .status(StatusCodes.CREATED)
        .json({ message: "User created successfully" });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return res
            .status(StatusCodes.CONFLICT)
            .json({ message: "Error user already exists" });
        }
      }
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

//login with email address and password
router.post(
  "/login",
  validate(userLoginSchema, ValidationType.BODY),
  async (req: TypedRequestBody<typeof userLoginSchema>, res: Response) => {
    const { email, password } = req.body;
    try {
      const userFound = await prisma.user.findUnique({
        where: {
          email,
        },
      });
      if (!userFound) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "No user found" });
      }
      const isAuthenticated = await bcrypt.compare(
        password,
        userFound.password,
      );
      if (!isAuthenticated) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Incorrect email or password" });
      }
      res.status(StatusCodes.OK).json(userFound);
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

//returns user information including profile data  USING THIS FOR OUR SESSION!!
router.post(
  "/user",
  validate(emailSchema, ValidationType.BODY),
  async (req: TypedRequestBody<typeof emailSchema>, res: Response) => {
    try {
      const userFound = await prisma.user.findUnique({
        where: {
          email: req.body.email,
        },
        include: {
          profile: true,
        },
      });
      res.status(StatusCodes.OK).json(userFound);
    } catch (error) {
      console.error(error);
      res.status(StatusCodes.OK).json({ message: "User not found" });
    }
  },
);

export default router;
