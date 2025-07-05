import InputWithLabel from "./inputBox";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import chatImage from "@/assets/message-code.png";

export default function SignIn() {
    return <>
    <div className="flex flex-col items-center justify-center h-full bg-[#222831] text-white">
        <img src={chatImage} className="h-10 w-10" />
        <div className="text-2xl font-bold p-4">Sign in to your account</div>
        <InputWithLabel label="Email" placeholder="Enter your Email" className="mb-3 border-[#393E46]" />
        <InputWithLabel label="Password" placeholder="* * * * * * " className="border-[#393E46]" type="password" />
        <Button onClick={()=>{

        }} variant="ghost" className="bg-green-500 w-[60%] m-3 text-gray-200">Log In</Button>
        <div>Don't have an account? <Link to={'/signup'} className="text-green-500" >Create account</Link></div>
    </div>
    </>
}