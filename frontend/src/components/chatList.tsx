import type { chatDetails } from "@/types"
import { useState } from "react"

export default function ChatList() {
    const [chatList,setChatList] = useState<chatDetails[]>([])
    return <>
        <div className="flex flex-col gap-2 px-2 overflow-y-auto h-[calc(100vh-250px)] custom-scrollbar">
                {chatList.map((chat)=>{
                    return <>
                        <div key={chat.id}></div>
                    </>
                })}
        </div>
    </>
}