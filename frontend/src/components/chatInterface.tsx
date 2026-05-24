import ChatTopBar from "./chatTopBar";
import ChatControls from "./chatControls";
import ChatList from "./chatList";
import { useRecoilValue } from "recoil";
import { selectedUser } from "@/store";
import DefaultChatInterface from "./defaultChatInterface";
import { useEffect, useState } from "react";
import { jwtDecode, type JwtPayload } from "jwt-decode";

export default function ChatInterface() {
  const user = useRecoilValue(selectedUser);
  const [decodedToken, setDecodedToken] = useState<JwtPayload | null>(null);

  useEffect(() => {
    console.log("chat interface mounted");
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
    return () => {
      console.log("chat interface unomunted");
    };
  }, []);

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
