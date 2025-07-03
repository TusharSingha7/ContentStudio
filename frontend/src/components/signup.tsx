import InputWithLabel from "./inputBox";
import CustomeButton from "./button";
import { Link } from "react-router-dom";

export default function SignUp() {
    return <>
    <div className="flex items-center justify-center h-full bg-gray-100">
        <div></div>
        <div></div>
        <div></div>
        <InputWithLabel/>
        <InputWithLabel/>
        <InputWithLabel/>
        <CustomeButton label="Create Account" onClick={()=>{

        }} Variant="secondary"/>
        <div>Already have an account ? <Link to={'/'}>Log In</Link></div>
    </div>
    </>
}