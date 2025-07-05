import type { userDetails } from "@/types";
import UserChat from "./userChat";


export default function RoomUserList({usersList}: {usersList: userDetails[]}) {

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