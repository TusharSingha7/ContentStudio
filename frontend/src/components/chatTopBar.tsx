
import closeImage from "@/assets/close.png";
import profileImage from "@/assets/profile-user.png";
import { useRecoilValue } from "recoil";
import { selectedUser } from "@/store";

export default function ChatTopBar() {
    const user = useRecoilValue(selectedUser);
    return <>
        <div className="flex h-16 bg-[#222831] text-white border-l border-b border-[#393E46]">
            <div className="flex-1 w-full flex items-center p-2 hover:bg-[#393E46] rounded cursor-pointer">
                <img src={profileImage} className="w-10 h-10" />
                <span className="flex flex-col pl-3">
                    <span> {user.name} </span>
                    <span className="text-sm text-gray-400"> {user.status} </span>
                </span>
            </div>
            <div className="flex items-center p-3 rounded hover:bg-[#393E46] cursor-pointer">
                <img src={closeImage} className="h-3 w-3" />
            </div>
        </div>
    </>
}