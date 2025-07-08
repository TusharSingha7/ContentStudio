import Header from "@/components/header";
import UserChatList from "@/components/userList";
import ChatInterface from "@/components/chatInterface";
import { useEffect } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { chatList, chatSocket } from "@/store";
import { api_url, websocket_url } from "@/config";
import { useNavigate } from "react-router";
import axios from "axios";

export default function Chat() {
    const [socket, setChatSocket] = useRecoilState(chatSocket);
    const setChatList = useSetRecoilState(chatList);
    const baseSocketUrl = websocket_url;
    const baseApiUrl = api_url;
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            navigate('/login');
            return; // Stop the effect here
        }

        async function verifyAndConnect() {
            try {
                await axios.get(`${baseApiUrl}/verify`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });

                console.log("User verified successfully.");

                if (!socket) {
                    const newSocket = new WebSocket(`${baseSocketUrl}/live-code`);
                    setChatSocket(newSocket);

                    newSocket.onopen = () => {
                        console.log("Chat socket connection established");
                    };

                    newSocket.onmessage = (message) => {
                        const msg = JSON.parse(message.data);
                        console.log(message);
                        if (msg.code === 4) {
                            setChatList(msg.data);
                        } else if (msg.code === 6) {
                            console.log(msg.data);
                            setChatList((oldList) => [...oldList, msg.data]);
                        }
                    };

                    newSocket.onclose = () => {
                        console.log("Chat websocket closed");
                    };

                    newSocket.onerror = (e) => {
                        console.log("Chat socket error", e);
                    };
                }
            } catch (error) {
                console.log("User is unverified. Redirecting to login.", error);
                navigate('/login');
            }
        }

        verifyAndConnect();

        return () => {
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.close();
                console.log("Chat socket cleaned up");
            }
        };
    }, [socket, setChatSocket, setChatList, baseSocketUrl, baseApiUrl, navigate]);

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="flex-1 grid grid-cols-2 grid-cols-[30%_70%] bg-[#222831]">
                <UserChatList />
                <ChatInterface />
            </div>
        </div>
    );
}