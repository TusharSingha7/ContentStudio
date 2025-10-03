import z from "zod";

export const projectDetailsSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string(),
  link: z.string().optional(),
  createdAt: z.date().optional(),
  userId: z.number(),
});
export const chatDetailsSchema = z.object({
  id: z.string().optional(),
  creatorId: z.number(),
  receiverId: z.number(),
  message: z.string(),
  createdAt: z.date().optional(),
  seen: z.string().optional(),
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
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export interface userDetails {
  id: number;
  email: string;
  name: string;
  iat: number;
}

export interface communication {
  code: number;
  data: any;
}

export interface chat {
  id: number;
  creatorId: number;
  receiverId: number;
  message: string;
  createdAt: string;
  seen: string;
}

export type UserDetailsSchema = z.infer<typeof userDetailsSchema>;

export type ChatDetailsSchema = z.infer<typeof chatDetailsSchema>;

export type ProjectDetailsSchema = z.infer<typeof projectDetailsSchema>;
