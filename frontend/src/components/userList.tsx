import { useEffect, useState } from "react";
import type { userDetails } from "../types";
import UserChat from "./userChat";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import logoutImage from "../assets/logout.png";

export default function UserChatList() {
    const [users,setUsers] = useState<userDetails[]>([]);

    useEffect(()=>{
        setUsers([
            {name: "Tushar", status: "online", id: "1", email: "tusinghar@gmail.com"},
            {name: "Tushar", status: "online", id: "1", email: "tusinghar@gmail.com"},
            {name: "Tushar", status: "online", id: "1", email: "tusinghar@gmail.com"},
            {name: "Tushar", status: "online", id: "1", email: "tusinghar@gmail.com"},
            {name: "Tushar", status: "online", id: "1", email: "tusinghar@gmail.com"},
            {name: "Tushar", status: "online", id: "1", email: "tusinghar@gmail.com"},
            {name: "Tushar", status: "online", id: "1", email: "tusinghar@gmail.com"},
            {name: "Tushar", status: "online", id: "1", email: "tusinghar@gmail.com"},
            {name: "Tushar", status: "online", id: "1", email: "tusinghar@gmail.com"},
            {name: "Tushar", status: "online", id: "1", email: "tusinghar@gmail.com"},
        ])
    },[])

    return <>
    <div className="flex flex-col bg-[#222831] relative">
    <div className="w-full max-w-sm min-w-full px-4 pt-4">
        <div className="relative flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="absolute w-5 h-5 top-2.5 left-2.5 text-slate-600">
            <path fill-rule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clip-rule="evenodd" />
            </svg>
        
            <input
            className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-[#393E46] rounded-md pl-10 pr-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
            placeholder="search users ..." 
            />
        </div>
    </div>
    <div className="border-t border-[#393E46] my-3 px-4 border-b border-gray-400 py-2 flex items-center">
        <Checkbox
          className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 
                     data-[state=checked]:text-white"
        />
        <span className="ml-2 text-sm text-gray-400">Show Online Users Only</span>
    </div>
    <div className="flex flex-col gap-2 px-2 overflow-y-auto h-[calc(100vh-250px)] custom-scrollbar">
        {users.map((user)=>{
            return <UserChat name={user.name} status={user.status} />
        })}
    </div>
    <div className="px-4 text-gray-400 text-sm">
        <Button className="border border-[#393E46] w-full py-2 mt-6 transition hover:bg-[#393e46] hover:text-white" variant="ghost" onClick={()=> {

        }} >
            <img src={logoutImage} alt="Logout" className="w-4 h-4" />
            Log Out
        </Button>
    </div>
    </div>
    </>
}