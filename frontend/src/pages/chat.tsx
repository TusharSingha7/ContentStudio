import Header from "@/components/header";
import UserChatList from "@/components/userList";
import ChatInterface from "@/components/chatInterface";
import { useEffect, useMemo, useRef, useState } from "react";
import { api_url } from "@/config";
import { useNavigate } from "react-router";
import axios from "axios";
import { useRecoilState, useSetRecoilState } from "recoil";
import { websocket_url } from "@/config";
import { chatSocket, chatList, selectedUser } from "@/store";
import { useRecoilValue } from "recoil";
import type { userDetails } from "@/types";
import { jwtDecode } from "jwt-decode";
import { liveCodeCodes } from "@/lib/liveCode";

export default function Chat() {
  const baseApiUrl = api_url;
  const navigate = useNavigate();
  const [socket, setChatSocket] = useRecoilState(chatSocket);
  const setChatList = useSetRecoilState(chatList);
  const baseSocketUrl = websocket_url;
  const targetUser = useRecoilValue(selectedUser);
  const activeThreadUserIdRef = useRef(targetUser.id);
  const [isSocketOpen, setIsSocketOpen] = useState(false);
  const currentUser = useMemo(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      return null;
    }

    try {
      return jwtDecode<userDetails>(token);
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    activeThreadUserIdRef.current = targetUser.id;
  }, [targetUser.id]);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
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
      .catch((error) => {
        console.log("User is unverified. Redirecting to login.", error);
        navigate("/login");
      });
  }, [baseApiUrl, navigate]);

  useEffect(() => {
    const newSocket = new WebSocket(`${baseSocketUrl}/live-code`);
    setChatSocket(newSocket);

    newSocket.onopen = () => {
      setIsSocketOpen(true);
    };

    newSocket.onmessage = (message) => {
      const msg = JSON.parse(message.data);
      if (msg.code === liveCodeCodes.chatHistoryResponse) {
        setChatList(msg.data);
        return;
      }

      if (msg.code === liveCodeCodes.chatMessageReceive) {
        const activeUserId = activeThreadUserIdRef.current;
        const chatBelongsToSelectedThread =
          activeUserId !== 0 &&
          (msg.data.receiverId === activeUserId ||
            msg.data.creatorId === activeUserId);

        if (chatBelongsToSelectedThread) {
          setChatList((oldChatList) => [...oldChatList, msg.data]);
        }
      }
    };

    newSocket.onclose = () => {
      setIsSocketOpen(false);
    };

    newSocket.onerror = () => {
      setIsSocketOpen(false);
    };

    return () => {
      if (
        newSocket.readyState === WebSocket.OPEN ||
        newSocket.readyState === WebSocket.CONNECTING
      ) {
        newSocket.close();
      }
      setIsSocketOpen(false);
      setChatSocket(null);
    };
  }, [setChatSocket, setChatList, baseSocketUrl]);

  useEffect(() => {
    if (
      !socket ||
      !isSocketOpen ||
      !currentUser ||
      targetUser.id === 0
    ) {
      return;
    }

    socket.send(
      JSON.stringify({
        code: liveCodeCodes.chatHistoryRequest,
        data: {
          userDetails: currentUser,
          selectedUser: targetUser,
        },
      })
    );
  }, [currentUser, isSocketOpen, socket, targetUser]);

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
