import profileImage from "../assets/profile-user.png";

export default function UserChat({name = "Anonymous" , status} : {
    name : string,
    status : "online" | "offline"
}) {
    return <>
    <div className=" flex bg-[#222831] h-12 rounded hover:bg-[#393e46] items-center gap-2 p-2 cursor-pointer hover:shadow-md transition-all duration-200">
        <img src={profileImage} className="h-10 w-10" />
        <div className="flex flex-col text-white">
            {name}
            <span className="text-gray-400 text-sm">
                {status}
            </span>
        </div>
    </div>
    </>
}