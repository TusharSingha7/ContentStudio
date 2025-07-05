import imageImage from "../assets/image.png";
import codeImage from "../assets/code.png";
import { Input } from "./ui/input";
import sendImage from "../assets/send.png";

export default function ChatControls() {
    return <>
        <div className="flex px-2 h-16 border-l bg-[#222831] items-center gap-2 border-[#393E46]">
            <img src={imageImage} className="h-5 w-5 hover:cursor-pointer " />
            <img src={codeImage} className="h-5 w-5 hover:cursor-pointer"/>
            <Input  className="px-2 text-white border-[#393E46]" placeholder="Type message here ..." />
            <img src={sendImage} className="h-7 w-7 hover:cursor-pointer"/>
        </div>
    </>
}