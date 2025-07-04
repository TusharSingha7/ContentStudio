import InputWithLabel from "./inputBox";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

export default function SignUp() {
    return <>
    <div className="flex flex-col items-center justify-center h-full bg-gray-100">
        <div></div>
        <div></div>
        <div></div>
        <InputWithLabel/>
        <InputWithLabel/>
        <InputWithLabel/>
        <Button onClick={()=>{

        }} variant="secondary"/>
        <div>Already have an account ? <Link to={'/login'}>Log In</Link></div>
    </div>
    </>
}