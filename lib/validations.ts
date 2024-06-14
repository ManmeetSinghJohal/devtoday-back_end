import { z } from "zod";
import { PostType } from "@prisma/client";

export const authSchema = z.object({
  username: z
    .string({ required_error: "is required" })
    .min(4, { message: "must be at least 4 characters long." })
    .max(20),
  email: z.string({ required_error: "is required" }).email("must be valid"),
  password: z
    .string({ required_error: "is required" })
    .min(8, { message: "must be at least 8 characters long." }),
});

export const userRegisterSchema = authSchema.required();

export const userLoginSchema = authSchema.omit({ username: true }).required();

export const emailSchema = authSchema.pick({ email: true });

export const idSchema = z.object({
  id: z.string({ required_error: "is required" }).length(36, {
    message: "Not a valid ID",
  }),
});

export const generalPostSchema = z.object({
  authorId: z.string({ required_error: "is required" }).length(36, {
    message: "Not a valid ID",
  }),
  title: z
    .string()
    .min(4, { message: "Title must be between 4 and 20 characters" })
    .max(120),
  createType: z.nativeEnum(PostType),
  groupId: z.string({ required_error: "is required" }).length(36, {
    message: "Not a valid ID",
  }),
  coverImage: z.string().optional(),
  audioFile: z.string().optional(),
  audioTitle: z.string().optional(),
  meetupLocation: z.string().optional(),
  meetupDate: z.coerce.date().optional(),
  tinyContent: z.string(),
  interestTechTags: z
    .array(z.string())
    .nonempty({ message: "must add at least one" })
    .max(7, { message: "You can only add 7 tags" }),
});

export const postSchema = generalPostSchema;

export const updatePostSchema = generalPostSchema
  .pick({ title: true, tinyContent: true })
  .required();

export const userPostsQuery = z.object({
  postType: z.nativeEnum(PostType).optional(),
  page: z.string().optional(),
});

export const viewerIdSchema = z.object({
  viewerId: z
    .string()
    .length(36, {
      message: "Not a valid ID",
    })
    .optional(),
});

export const followViewerIdSchema = z
  .object({
    viewerId: z.string().length(36, {
      message: "Not a valid ID",
    }),
  })
  .required();

export const onBoardingSchema = z
  .object({
    journey: z.string().min(4, {
      message: "must be at least 4 characters",
    }),
    ambitions: z
      .string()
      .array()
      .nonempty({ message: "must choose at least one" }),
    tech: z.string().array().nonempty({ message: "must choose at least one" }),
    id: z.string({ required_error: "is required" }).length(36, {
      message: "Not a valid ID",
    }),
  })
  .required();

export const profileSchema = z.object({
  name: z.string().optional(),
  bio: z
    .string()
    .max(130, {
      message: "maximum of 130 characters",
    })
    .optional(),
  githubLink: z.string().optional(),
  githubHandle: z.string().optional(),
  linkedinLink: z.string().optional(),
  linkedinHandle: z.string().optional(),
  xProfileLink: z.string().optional(),
  xProfileHandle: z.string().optional(),
  instagramLink: z.string().optional(),
  instagramHandle: z.string().optional(),
});

export const likerIdSchema = z.object({
  likerId: z.string({ required_error: "is required" }).length(36, {
    message: "Not a valid ID",
  }),
});

export const groupSchema = z.object({
  name: z.string().min(4, { message: "must be at least 4 characters long." }),
  bio: z.string().min(10, { message: "must be at least 10 characters long." }),
  profileImage: z.string().optional(),
  coverImage: z.string().optional(),
  creatorId: z.string({ required_error: "is required" }).length(36, {
    message: "Not a valid ID",
  }),
  members: z.array(
    z.object({
      userId: z.string(),
      isAdmin: z.boolean().optional(),
    }),
  ),
});

export const editGroupSchema = z.object({
  name: z
    .string()
    .min(4, { message: "must be at least 4 characters long." })
    .optional(),
  bio: z
    .string()
    .min(10, { message: "must be at least 10 characters long." })
    .optional(),
  profileImage: z.string().optional(),
  coverImage: z.string().optional(),
  userId: z.string({ required_error: "is required" }).length(36, {
    message: "Not a valid ID",
  }),
});

export const userGroupQuery = z.object({
  page: z.string().optional(),
  search: z.string().optional(),
  size: z.string().optional(),
});

export const updateGroupSchema = z.object({
  name: z.string().optional(),
  bio: z.string().optional(),
  profileImage: z.string().optional(),
  coverImage: z.string().optional(),
});

export const adminUserSchema = z.object({
  creatorId: z.string({ required_error: "is required" }).length(36, {
    message: "Not a valid ID",
  }),
  memberId: z.string({ required_error: "is required" }).length(36, {
    message: "Not a valid ID",
  }),
});

export const membersSchema = z.object({
  members: z.array(
    z.object({
      userId: z.string(),
      isAdmin: z.boolean().optional(),
    }),
  ),
});

export const groupMembersQuery = z.object({
  page: z.string().optional(),
});

export const joinGroupSchema = z.object({
  userId: z.string({ required_error: "is required" }).length(36, {
    message: "Not a valid ID",
  }),
});
export const leaveGroupSchema = z.object({
  userId: z.string({ required_error: "is required" }).length(36, {
    message: "Not a valid ID",
  }),
});

export const removeMemberSchema = z.object({
  memberId: z.string({ required_error: "is required" }).length(36, {
    message: "Not a valid ID",
  }),
  adminId: z.string({ required_error: "is required" }).length(36, {
    message: "Not a valid ID",
  }),
});
