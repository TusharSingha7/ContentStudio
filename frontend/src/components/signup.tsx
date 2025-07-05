import InputWithLabel from "./inputBox";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import chatImage from "@/assets/message-code.png";

export default function SignUp() {
    return <>
    <div className="flex flex-col items-center justify-center h-full bg-[#222831] text-white">
        <img src={chatImage} className="h-10 w-10" />
        <div className="text-2xl font-bold p-4">Create Account</div>
        <div className="text-sm text-gray-400 pb-4">Get started with your free account</div>
        <InputWithLabel label="Full Name" placeholder="Enter you name" className="mb-3 border-[#393E46]" />
        <InputWithLabel label="Email" placeholder="Enter your Email" className="mb-3 border-[#393E46]" />
        <InputWithLabel label="Password" placeholder="* * * * * * " className="border-[#393E46]" type="password" />
        <Button onClick={()=>{

        }} variant="ghost" className="bg-green-500 w-[60%] m-3 text-gray-200">Create Account</Button>
        <div>Already have an account ? <Link to={'/login'} className="text-green-500">Log In</Link></div>
    </div>
    </>
}