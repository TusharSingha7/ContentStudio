import imageImage from "../assets/image.png";
import codeImage from "../assets/code.png";
import { Input } from "./ui/input";
import sendImage from "../assets/send.png";
import type { JwtPayload } from "jwt-decode";
import { useState } from "react";
import { chatSocket, selectedUser } from "@/store";
import { useRecoilValue } from "recoil";
import { v4 as uuidv4 } from 'uuid';


export default function ChatControls({decode} : {
    decode : JwtPayload
}) {
    const socket = useRecoilValue(chatSocket)
    const [text,setText] = useState<string>("");
    const user = useRecoilValue(selectedUser);

    const handleSend = ()=> {
        console.log("clicked")
        if(text.length > 0 && socket) {
            socket.send(JSON.stringify({
                code : 6,
                data : {
                    userDetails : decode,
                    selectedUser : user,
                    message : {
                        type : 1,
                        content : text
                    }
                }
            }));
        }
        setText("")
    }

    return <>
        <div className="flex px-2 h-16 border-l bg-[#222831] items-center gap-2 border-[#393E46]">
            <img src={imageImage} className="h-5 w-5 hover:cursor-pointer " />
            <img src={codeImage} className="h-5 w-5 hover:cursor-pointer" onClick={()=>{
                const sessionId = uuidv4()
                if(socket) {
                    socket.send(JSON.stringify({
                        code : 6,
                        data : {
                            userDetails : decode,
                            selectedUser : user,
                            message : {
                                type : 0,
                                content : sessionId
                            }
                        }
                    }));
                }
            }} />
            <Input  className="px-2 text-white border-[#393E46] focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#0D7500] " placeholder="Type message here ..." onChange={(e)=>{
                setText(e.target.value);
            }} onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        handleSend();
                    }
                }}
                value={text} 
                />
            <img src={sendImage} className="h-7 w-7 hover:cursor-pointer" onClick={handleSend} />
        </div>
    </>
}