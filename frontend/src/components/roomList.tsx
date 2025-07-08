import type { userDetails } from "@/types";
import UserChat from "./userChat";
import { useEffect, useRef,useState } from 'react';
import {jwtDecode} from 'jwt-decode'
import { websocket_url } from "@/config";
import { useParams } from "react-router";

export default function RoomUserList() {

    const websocket = useRef<WebSocket | null>(null);
    const [usersList,setUserList] = useState<userDetails[]>([])
    const baseSocketUrl = websocket_url
    const {id : sessionId} = useParams();

    useEffect(()=> {
        if(!websocket.current) {
            const socket = new WebSocket(`${baseSocketUrl}/live-code`);

            socket.addEventListener('open',()=>{
                console.log("live-code connection established");
            })

            socket.addEventListener('message',(message)=> {
                const msg = JSON.parse(message.data);
                console.log(msg)
                if(msg.code == 1 && sessionId) {
                    const token = localStorage.getItem("token") || "";
                    const decoded = jwtDecode(token);
                    console.log(decoded);
                    socket.send(JSON.stringify({
                        code : 1,
                        data : {
                            userDetails : decoded,
                            roomId : sessionId
                        }
                    }))
                }
                else if(msg.code == 2) {
                    //list
                    console.log(msg.data);
                    setUserList(msg.data);
                }

            })
            socket.addEventListener('close',()=>{
                console.log("live-code connection closed ")
            })

            socket.addEventListener('error',()=>{
                console.log("error occured");
            })

            websocket.current = socket;

        }
    },[baseSocketUrl,sessionId])

    return <>
        <div className="h-screen flex flex-col bg-[#222831] text-white min-w-[20%] ">
            <h1 className="text-md text-center p-7">Online Users : {usersList.length}</h1>
            <ul className=" p-2 overflow-y-auto custom-scrollbar">
                {usersList.map((user)=> {
                    return (
                        <UserChat id={user.id} key={user.email} name={user.name} status="online" />
                    )
                })}
            </ul>
        </div>
    </>
}