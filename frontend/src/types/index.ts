

export interface userDetails {
    id: string;
    name: string;
    email: string;
    status: "online" | "offline";
}

export interface projectDetails {
    id: string;
    title: string;
    description: string;
    projectUrl: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
}

export interface chatDetails {
    id: number;
    senderId: string;
    receiverId: string;
    message: string;
    createdAt: Date;
}