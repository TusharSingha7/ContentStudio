import { chatList } from "@/store";
import { useRecoilValue } from "recoil";
import { useEffect, useRef } from "react";
import type { chatDetails, userDetails } from "@/types";
import { Button } from "./ui/button";
import { useNavigate } from "react-router";
import { useSetRecoilState } from "recoil";
import { selectedUser } from "@/store";
import { jwtDecode } from "jwt-decode";
import { parseChatMessage } from "@/lib/liveCode";

export default function ChatList() {
  const chattList = useRecoilValue(chatList);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [chattList]);

  return (
    <>
      <div
        ref={chatContainerRef}
        className="flex flex-col gap-2 px-2 overflow-y-auto h-[calc(100vh-250px)] custom-scrollbar scroll-auto scroll-smooth"
      >
        {chattList.map((chat) => {
          return <BubbleCompo message={chat} key={chat.id} />;
        })}
      </div>
    </>
  );
}

function BubbleCompo({ message }: { message: chatDetails }) {
  const user = useRecoilValue(selectedUser);
  const currentUser = (() => {
    const token = localStorage.getItem("token");
    if (!token) {
      return null;
    }

    try {
      return jwtDecode<userDetails>(token);
    } catch {
      return null;
    }
  })();
  const parsedMessage = parseChatMessage(message.message);
  const content = parsedMessage.content;
  const type = parsedMessage.type;
  const navigate = useNavigate();
  const setUser = useSetRecoilState(selectedUser);
  const isIncoming = currentUser ? message.creatorId === user.id : false;

  return (
    <div
      className={`flex items-start ${isIncoming ? "justify-start" : "justify-end"} gap-2.5 my-2`}
    >
      <div
        className={`flex flex-col w-full max-w-[320px] leading-1.5 p-4 border-gray-200 bg-[#0D7500]
                ${
                  isIncoming
                    ? "rounded-e-xl rounded-es-xl"
                    : "rounded-s-xl rounded-se-xl"
                }
                `}
      >
        <p className="text-sm font-normal py-2.5 text-gray-900 dark:text-white">
          {" "}
          {type == 0 ? (
            <Button
              className="border border-gray-900 bg-[#0A400C]"
              onClick={() => {
                setUser(() => {
                  return {
                    id: 0,
                    name: "default",
                    email: "",
                    status: "offline",
                  };
                });
                navigate(`/editor/${content}`);
              }}
            >
              Join Editor
            </Button>
          ) : (
            content
          )}{" "}
        </p>
        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
          {new Date(message.createdAt).toLocaleString()}
        </span>
      </div>
    </div>
  );
}
