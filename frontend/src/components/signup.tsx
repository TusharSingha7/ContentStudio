
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import chatImage from "@/assets/message-code.png";
import { useState } from "react";
import axios from 'axios'
import { api_url } from "@/config";

export default function SignUp() {

    const [name,setName] = useState<string>("");
    const [email,setEmail] = useState<string>("");
    const [pass , setPass] = useState<string>("");
    const navigate = useNavigate();
    const baseApiUrl = api_url

    return <>
    <div className="flex flex-col items-center justify-center h-full bg-[#222831] text-white">
        <img src={chatImage} className="h-10 w-10" />
        <div className="text-2xl font-bold p-4">Create Account</div>
        <div className="text-sm text-gray-400 pb-4">Get started with your free account</div>
        <div className="grid w-full max-w-sm items-center gap-3">
            <div className="w-full max-w-sm min-w-[200px]">
                <div className="relative">
                    <input
                    onChange={(e)=>{setName(e.target.value)}}
                    className="text-white mb-3 border-[#393E46] peer w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                    />
                    {name === "" && <label className=" bg-[#222831] absolute cursor-text px-1 left-2.5 top-2.5 text-slate-400 text-sm transition-all transform origin-left peer-focus:-top-2 peer-focus:left-2.5 peer-focus:text-xs peer-focus:text-slate-400 peer-focus:scale-90">
                        Type Name...
                    </label>}
                </div>
            </div>
        </div>
        <div className="grid w-full max-w-sm items-center gap-3">
            <div className="w-full max-w-sm min-w-[200px]">
                <div className="relative">
                    <input
                    onChange={(e)=>{setEmail(e.target.value)}}
                    className="text-white mb-3 border-[#393E46] peer w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                    />
                    {email === "" && <label className=" bg-[#222831] absolute cursor-text px-1 left-2.5 top-2.5 text-slate-400 text-sm transition-all transform origin-left peer-focus:-top-2 peer-focus:left-2.5 peer-focus:text-xs peer-focus:text-slate-400 peer-focus:scale-90">
                        Type Email...
                    </label>}
                </div>
            </div>
        </div>
        <div className="grid w-full max-w-sm items-center gap-3">
            <div className="w-full max-w-sm min-w-[200px]">
                <div className="relative">
                    <input
                    onChange={(e)=>{setPass(e.target.value)}}
                    type="password"
                    className="text-white mb-3 border-[#393E46] peer w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                    />
                    {pass === "" && <label className=" bg-[#222831] absolute cursor-text px-1 left-2.5 top-2.5 text-slate-400 text-sm transition-all transform origin-left peer-focus:-top-2 peer-focus:left-2.5 peer-focus:text-xs peer-focus:text-slate-400 peer-focus:scale-90">
                        Type Password...
                    </label>}
                    <p className="flex items-start mt-2 text-xs text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-1.5">
                            <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" />
                        </svg>
                    
                        Use at least 8 characters, one uppercase, one lowercase and one number.
                    </p>
                </div>
            </div>
        </div>
        <Button onClick={async ()=>{
            try {
                const response = await axios.post(`${baseApiUrl}/user`,{
                    name : name,
                    email : email,
                    password : pass
                });
                if(response) {
                    localStorage.setItem("token",response.data.token);
                    navigate('/');
                }
            }catch(e) {
                console.log(e);
            }
        }} variant="ghost" className="bg-green-500 w-[60%] m-3 text-gray-200">Create Account</Button>
        <div>Already have an account ? <Link to={'/login'} className="text-green-500">Log In</Link></div>
    </div>
    </>
}