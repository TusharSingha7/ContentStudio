import InputWithLabel from "./inputBox";
import { Link } from "react-router";
import { Button } from "./ui/button";

export default function SignIn() {
    return <>
    <div className="flex flex-col items-center justify-center h-full bg-gray-100">
        <div></div>
        <div></div>
        <InputWithLabel/>
        <InputWithLabel/>
        <Button onClick={()=>{

        }} variant="secondary"/>
        <div>Don't have an account? <Link to={'/signup'}>Create account</Link></div>
    </div>
    </>
}