import chatImage from "../assets/message-code.png";

export default function DefaultChatInterface() {
    return <>
        <div className="flex flex-col items-center border-l justify-center bg-[#1d2f33]">
            <img src={chatImage} alt="chatImage" className="my-4 w-24 h-24 animate-pulse bg-[#034437]/40 border border-[#034437] p-3 rounded-xl" />
            <h1 className="font-bold text-4xl text-white my-4">Welcome to CodeStudio!</h1>
            <p className="text-xl text-gray-500 my-2 w-[50%] text-center">Select a conversation from sidebar to start coding together</p>
            <div className="flex flex-col bg-[#141514] border border-[#2f302e] shadow text-white w-[50%] p-5 rounded">
                <h2> <span className="text-green-400">//</span> Features : </h2>
                <ul className={`list-disc pl-5 mt-2 marker:text-green-400`}>
                    <li>Real-time messaging</li>
                    <li>Code collaboration</li>
                    <li>project showcase</li>
                </ul>
            </div>
        </div>
    </>
}