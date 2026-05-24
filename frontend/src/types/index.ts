export interface userDetails {
  id: number;
  name: string;
  email: string;
  status: "online" | "offline";
  createdAt?: Date | string;
  projects?: projectDetails[];
  createdChats?: chatDetails[];
  receivedChats?: chatDetails[];
  avatarUrl?: string;
}

export interface projectDetails {
  id: string;
  title: string;
  description: string;
  link?: string;
  createdAt: Date | string;
  userId: number;
}

export interface chatDetails {
  id: string;
  creatorId: number;
  receiverId: number;
  message: string;
  createdAt: Date | string;
  seen?: boolean | null;
}
