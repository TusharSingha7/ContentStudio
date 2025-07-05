import ChatTopBar from "./chatTopBar";
import ChatControls from "./chatControls";
import ChatList from "./chatList";
import { useEffect, useState } from "react";
import type { chatDetails, userDetails } from "@/types";

export default function ChatInterface() {

    const [chatList, setChatList] = useState<chatDetails[]>([]);
    const [userDetails, setUserDetails] = useState<userDetails>({
        id: "user",
        name: "John Doe",
        status: "online",
        email: ""
    });

    useEffect(()=>{
        setChatList([
            {
            id: 1,
            message: "Hello, how can I help you?",
            senderId: "bot",
            createdAt: new Date(),
            receiverId: "user"
        },
        {
            id: 2,
            message: "I need help with my account.",
            senderId: "user",
            createdAt: new Date(),
            receiverId: "user"
        },
        {
            id: 3,
            message: "Sure, I can help you with that.",
            senderId: "bot",
            createdAt: new Date(),
            receiverId: "user"
        }
        ]);
        setUserDetails({
            id: "user",
            name: "John Doe",
            status: "online",
            email: ""
        })
    },[]);

    return <>
    <div className="flex flex-col h-full">
        <ChatTopBar props={userDetails} />
        <div className="flex-1 border-l border-[#393E46]">
            <ChatList chatList={chatList} />
        </div>
        <ChatControls/>
    </div>
    </>
}