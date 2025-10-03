import Header from "@/components/header";
import UserChatList from "@/components/userList";
import ChatInterface from "@/components/chatInterface";
import { useEffect ,useRef } from "react";
import { api_url } from "@/config";
import { useNavigate } from "react-router";
import axios from "axios";
import { useRecoilState, useSetRecoilState } from "recoil";
import { websocket_url } from "@/config";
import { chatSocket, chatList, selectedUser } from "@/store";
import { useRecoilValue } from "recoil";
import type { userDetails } from "@/types";

export default function Chat() {
  const baseApiUrl = api_url;
  const navigate = useNavigate();
  const [socket, setChatSocket] = useRecoilState(chatSocket);
  const setChatList = useSetRecoilState(chatList);
  const baseSocketUrl = websocket_url;
  const targetUser = useRecoilValue(selectedUser);
  const user =  useRef<userDetails>({id:0, name:"", email:"", status:"offline"});

  useEffect(() => {
    user.current = targetUser;
  }, [targetUser])

  useEffect(() => {
    console.log("chat verification mounted");
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return; // Stop the effect here
    }

    async function verifyAndConnect() {
      try {
        await axios.get(`${baseApiUrl}/verify`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      } catch (error) {
        console.log("User is unverified. Redirecting to login.", error);
        navigate("/login");
      }
    }

    verifyAndConnect()
      .then(() => {
        console.log("User verified successfully.");
      })
      .catch((error) => {
        console.log("User is unverified. Redirecting to login.", error);
        navigate("/login");
      });

    return () => {
      console.log("chat verification unmounted");
    };
  }, [baseApiUrl, navigate]);

  useEffect(() => {
    console.log("chat socket connecting mounted");
    try {
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
            console.log("chat recieved code 4 from server")
            setChatList(msg.data);
          } else if (msg.code === 6) {
            console.log("chat received code 6 from server")
            console.log(msg.data);
            console.log(user);
            if(user.current.id == msg.data.receiverId || user.current.id == msg.data.creatorId) {
              // i am the sender  or receiver
              setChatList((oldChatList) => [...oldChatList, msg.data]);
            }
          }
        };

        newSocket.onclose = () => {
          console.log("Chat websocket closed");
        };

        newSocket.onerror = (e) => {
          console.log("Chat socket error", e);
        };
      } else console.log("socket already present");
    } catch (err) {
      console.log("error : ", err);
    }
    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
        setChatSocket(() => null);
        console.log("Chat socket cleaned up");
      }
      console.log("chat socket unmounted");
    };
  }, [socket, setChatSocket, setChatList, baseSocketUrl]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 grid grid-cols-[30%_70%] bg-[#222831]">
        <UserChatList />
        <ChatInterface />
      </div>
    </div>
  );
}
