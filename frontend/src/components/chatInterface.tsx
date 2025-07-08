import ChatTopBar from "./chatTopBar";
import ChatControls from "./chatControls";
import ChatList from "./chatList";
import { useRecoilValue } from "recoil";
import { chatSocket, selectedUser } from "@/store";
import DefaultChatInterface from "./defaultChatInterface";
import { useEffect, useState } from "react"; 
import { jwtDecode, type JwtPayload } from "jwt-decode";

export default function ChatInterface() {
    const socket = useRecoilValue(chatSocket);
    const user = useRecoilValue(selectedUser);
    const [decodedToken, setDecodedToken] = useState<JwtPayload | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setDecodedToken(decoded);
            } catch (error) {
                console.error("Failed to decode JWT:", error);
                setDecodedToken(null); 
            }
        }
    }, []);

    useEffect(() => {
        if (socket && socket.readyState === socket.OPEN && decodedToken) {
            socket.send(JSON.stringify({
                code: 4,
                data: {
                    userDetails: decodedToken,
                    selectedUser: user
                }
            }));
        }
    }, [socket, user, decodedToken]);

    return (
        <>
            {user.id === 0 ? (
                <DefaultChatInterface />
            ) : (
                <div className="flex flex-col h-full">
                    <ChatTopBar />
                    <div className="flex-1 border-l border-[#393E46]">
                        <ChatList />
                    </div>
                    {/* Pass the decoded token safely */}
                    <ChatControls decode={decodedToken} />
                </div>
            )}
        </>
    );
}