import ChatTopBar from "./chatTopBar";
import ChatControls from "./chatControls";
import ChatList from "./chatList";
import { useRecoilValue } from "recoil";
import {  chatSocket, selectedUser } from "@/store";
import DefaultChatInterface from "./defaultChatInterface";
import {  useEffect} from "react";
import { jwtDecode } from "jwt-decode";

export default function ChatInterface() {
    const socket = useRecoilValue(chatSocket);
    const user = useRecoilValue(selectedUser);
    const token = localStorage.getItem("token") || "";
    const decode = jwtDecode(token);

    useEffect(()=> {
        if(socket && socket.readyState == socket.OPEN) {
            
            socket.send(JSON.stringify({
                code:4,
                data : {
                    userDetails : decode,
                    selectedUser : user
                }
            }))
        }
    },[socket,decode,user])
    return (<>
        {user.id === 0 ? (
            <DefaultChatInterface />
        ) : (
            <div className="flex flex-col h-full">
            <ChatTopBar />
            <div className="flex-1 border-l border-[#393E46]">
                <ChatList />
            </div>
            <ChatControls decode={decode} />
            </div>
        )}
        </>
    );
    }