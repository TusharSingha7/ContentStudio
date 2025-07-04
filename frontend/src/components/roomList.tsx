import type { userDetails } from "@/types";
import UserChat from "./userChat";
import { useEffect, useState } from "react";


export default function RoomUserList() {
    const [usersList,setUsersList] = useState<userDetails[]>([]);

    useEffect(()=>{
        setUsersList([
            {
                id: "1",
                name: "John Doe",
                status: "online",
                email: ""
            },
            {
                id: "1",
                name: "John Doe",
                status: "online",
                email: ""
            },
            {
                id: "1",
                name: "John Doe",
                status: "online",
                email: ""
            },
            {
                id: "1",
                name: "John Doe",
                status: "online",
                email: ""
            },
        ])
    },[])
    return <>
        <div className="h-screen flex flex-col bg-[#222831] text-white min-w-[20%] ">
            <h1 className="text-xl p-7 border border-[#393E46]">Online Users : {usersList.length}</h1>
            <ul className="border-t border-t-[#393E46] p-2">
                {usersList.map((user)=> {
                    return <>
                        <UserChat name={user.name} status="online" />
                    </>
                })}
            </ul>
        </div>
    </>
}