import ChatTopBar from "./chatTopBar";
import ChatControls from "./chatControls";
import ChatList from "./chatList";
import { useEffect, useState } from "react";
import type { userDetails } from "@/types";

export default function ChatInterface() {

    const [userDetails, setUserDetails] = useState<userDetails>({
        id: 123,
        name: "John Doe",
        status: "online",
        email: ""
    });

    useEffect(()=>{
        setUserDetails({
            id: 1,
            name: "John Doe",
            status: "online",
            email: ""
        })
    },[]);

    return <>
    <div className="flex flex-col h-full">
        <ChatTopBar props={userDetails} />
        <div className="flex-1 border-l border-[#393E46]">
            <ChatList />
        </div>
        <ChatControls/>
    </div>
    </>
}