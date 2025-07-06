import { chatList, selectedUser } from "@/store"
import { useRecoilValue } from "recoil"
import { useEffect , useRef } from "react";
import type { chatDetails } from "@/types";
import { Button } from "./ui/button";
import { useNavigate } from "react-router";

export default function ChatList() {

    const chattList = useRecoilValue(chatList);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const chatContainer = chatContainerRef.current;
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }, [chattList]);
    
    return <>
        <div ref={chatContainerRef} className="flex flex-col gap-2 px-2 overflow-y-auto h-[calc(100vh-250px)] custom-scrollbar scroll-auto scroll-smooth">
                {chattList.map((chat)=>{
                return (
                    <BubbleCompo message={chat} key={chat.id} />
                    )
                })}
        </div>
    </>
}

function BubbleCompo({message} : {
    message : chatDetails
}) {
    const user = useRecoilValue(selectedUser);
    const parsedMessage = JSON.parse(message.message)
    const content = parsedMessage.content;
    const type = parsedMessage.type
    const navigate = useNavigate();

    return (
        <div className={`flex items-start justify-${user.id == message.creatorId ? "start" : "end"} gap-2.5 my-2`}>
            <div className={`flex flex-col w-full max-w-[320px] leading-1.5 p-4 border-gray-200 bg-[#0D7500] dark:bg-[#0D7500]
                ${user.id == message.creatorId ? "rounded-e-xl rounded-es-xl" : "rounded-s-xl rounded-se-xl"}
                `}>
                <p className="text-sm font-normal py-2.5 text-gray-900 dark:text-white"> {
                    type == 0 ? (
                        <Button className="border border-gray-900 bg-[#0A400C]" onClick={()=>{
                            navigate(`/editor/sessionId?${content}`)
                        }} >
                            Join Editor
                        </Button>
                    ) : content
                    } </p>
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{JSON.stringify(message.createdAt)}</span>
            </div>
        </div>
    )
}

