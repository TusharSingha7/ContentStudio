import type { chatDetails } from "@/types"

export default function ChatList({chatList} : {
    chatList : chatDetails[]
}) {
    return <>
        <div className="flex flex-col gap-2 px-2 overflow-y-auto h-[calc(100vh-250px)] custom-scrollbar">
                {chatList.map(()=>{
                    return <>
                    </>
                })}
        </div>
    </>
}