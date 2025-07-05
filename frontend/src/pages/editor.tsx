import CodeEditor from "@/components/codeEditor";
import RoomUserList from "@/components/roomList";
import type { userDetails } from "@/types";
import { useEffect, useRef,useState } from 'react';

export default function Editor() {
    const websocket = useRef<WebSocket | null>(null);
    const [usersList, setUserList] = useState<userDetails[]>([]);

    useEffect(() => {
        if (!websocket.current) {
            websocket.current = new WebSocket('ws://localhost:3000/live-code');
            websocket.current.onopen = () => {
                console.log('WebSocket connection established');
            };
            websocket.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log('Message received from server:', data);
                if(data.code == 1) {
                    //send user details to server

                }
                else if(data.code == 2) {
                    //update user list received from server
                    console.log('User list updated:', data.users);
                    setUserList(data.users);
                }
            };
            websocket.current.onclose = () => {
                console.log('WebSocket connection closed');
            };
        }
        return () => {
            if (websocket.current) {
                websocket.current.close();
            }
        };
    }, []);
    return <>
        <div className="min-h-screen flex">
            <RoomUserList usersList = {usersList} />
            <CodeEditor/>
        </div>
    </>
}