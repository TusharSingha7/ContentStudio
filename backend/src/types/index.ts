
import z from "zod";

export const projectDetailsSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string(),
  link: z.string().optional(),
  createdAt: z.date().optional(),
  userId: z.number()
});
export const chatDetailsSchema = z.object({
  id: z.string().optional(),
  creatorId: z.number(),
  receiverId: z.number(),
  message: z.string(),
  createdAt: z.date().optional()
});

export const userDetailsSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  email: z.string().email(),
  status: z.enum(["online", "offline"]).optional(),
  createdAt: z.date().optional(),
  projects: z.array(projectDetailsSchema).optional(),
  createdChats: z.array(chatDetailsSchema).optional(),
  receivedChats: z.array(chatDetailsSchema).optional(),
  avatarUrl: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters long")
});

export type UserDetails = z.infer<typeof userDetailsSchema>;

export type ChatDetails = z.infer<typeof chatDetailsSchema>;

export type ProjectDetails = z.infer<typeof projectDetailsSchema>;
