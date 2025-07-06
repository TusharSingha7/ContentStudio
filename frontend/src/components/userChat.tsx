import { useRecoilValue } from "recoil";
import profileImage from "../assets/profile-user.png";
import { selectedUser } from "@/store";

export default function UserChat({id , name = "Anonymous" , status} : {
    id : number
    name : string,
    status : "online" | "offline"
}) {
    const user = useRecoilValue(selectedUser);
    return <>
    <div className={` flex ${user.id == id ? "bg-[#0D7500]" : "bg-[#222831]"} h-12 rounded hover:bg-[#393e46] items-center gap-2 p-2 cursor-pointer hover:shadow-md transition-all duration-200`}>
        <img src={profileImage} className="h-10 w-10" />
        <div className="flex flex-col text-white">
            {name}
            <span className="text-gray-400 text-sm text-left">
                {status}
            </span>
        </div>
    </div>
    </>
}