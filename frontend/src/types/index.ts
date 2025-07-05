

export interface userDetails {
    id: number;
    name: string;
    email: string;
    status: "online" | "offline";
    createdAt?: Date;
    projects?: projectDetails[];
    createdChats?: chatDetails[];
    receivedChats?: chatDetails[];
    avatarUrl?: string;
}

export interface projectDetails {
    id: string;
    title: string;
    description: string;
    link: string;
    createdAt: Date;
    userId: number;
}

export interface chatDetails {
    id: string;
    creatorId: number;
    receiverId: number;
    message: string;
    createdAt: Date;
}
