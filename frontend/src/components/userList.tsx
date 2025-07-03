import CustomButton from "./button";
import { useEffect, useState } from "react";
import type { userDetails } from "../types";
import UserChat from "./userChat";

export default function UserChatList() {
    const [users,setUsers] = useState<userDetails[]>([]);

    useEffect(()=>{
        setUsers([{name: "Tushar", status: "online", id: "1", email: "tusinghar@gmail.com"}])
    },[users])

    return <>
    <div>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="absolute w-5 h-5 top-2.5 left-2.5 text-slate-600">
        <path fill-rule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clip-rule="evenodd" />
        </svg>
    
        <input
        className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-10 pr-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
        placeholder="UI Kits, Dashboards..." 
        />
    </div>
    <div>
        online how many users
    </div>
    <div>
        {users.map((user)=>{
            return <UserChat name={user.name} status={user.status} />
        })}
    </div>
    <div>
        <CustomButton Variant="secondary" label="Log Out" onClick={()=> {

        }} />
    </div>
    </>
}