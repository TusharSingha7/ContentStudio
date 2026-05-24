import type { userDetails } from "@/types";
import UserChat from "./userChat";
import { useEffect, useMemo, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { websocket_url } from "@/config";
import { useParams } from "react-router";
import { liveCodeCodes } from "@/lib/liveCode";

export default function RoomUserList() {
  const websocket = useRef<WebSocket | null>(null);
  const [usersList, setUserList] = useState<userDetails[]>([]);
  const baseSocketUrl = websocket_url;
  const pairs = useParams();
  const sessionId = pairs.id;
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
    if (!sessionId || !currentUser) {
      return;
    }

    const socket = new WebSocket(`${baseSocketUrl}/live-code`);
    websocket.current = socket;

    socket.addEventListener("message", (message) => {
      const msg = JSON.parse(message.data);
      if (msg.code === liveCodeCodes.userHandshakeRequest) {
        socket.send(
          JSON.stringify({
            code: liveCodeCodes.roomJoin,
            data: {
              userDetails: currentUser,
              roomId: sessionId,
            },
          })
        );
      } else if (msg.code === liveCodeCodes.roomPresenceUpdate) {
        setUserList(msg.data);
      }
    });

    return () => {
      socket.close();
      websocket.current = null;
    };
  }, [baseSocketUrl, currentUser, sessionId]);

  return (
    <div className="h-screen flex flex-col bg-[#111827] text-white min-w-[240px] w-[22%] overflow-hidden border-r border-slate-800">
      <div className="px-6 py-6 border-b border-slate-800">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">
          Room Presence
        </p>
        <h1 className="text-xl font-semibold mt-2">Online Users</h1>
        <p className="text-sm text-slate-400 mt-1">{usersList.length} active</p>
      </div>
      <ul className="p-3 overflow-y-auto custom-scrollbar flex-1">
        {usersList.map((user) => {
          return (
            <UserChat
              id={user.id}
              key={user.email}
              name={user.name}
              status="online"
              color="bg-slate-800"
            />
          );
        })}
      </ul>
    </div>
  );
}
