import InputWithLabel from "./inputBox";
import CustomeButton from "./button";
import { Link } from "react-router";

export default function SignIn() {
    return <>
    <div className="flex items-center justify-center h-full bg-gray-100">
        <div></div>
        <div></div>
        <InputWithLabel/>
        <InputWithLabel/>
        <CustomeButton label="Log In" onClick={()=>{

        }} Variant="secondary"/>
        <div>Don't have an account? <Link to={'/'}>Create account</Link></div>
    </div>
    </>
}