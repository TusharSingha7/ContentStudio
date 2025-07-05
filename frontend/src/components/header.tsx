import chatImage from "../assets/message-code.png";


export default function Header() {
    return <>
    <div className="text-white font-bold bg-[#222831] h-16 p-2 text-center items-center flex border-b border-[#393E46]">
        <img src={chatImage} alt="chatImage" className="h-12 w-12 mx-2 rounded-lg bg-[#1d2f33] p-2 "/>
        <span className="mx-2">CodeStudio</span> 
    </div>
    </>
}