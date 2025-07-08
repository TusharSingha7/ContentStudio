import CodeEditor from "@/components/codeEditor";
import RoomUserList from "@/components/roomList";
import { api_url } from "@/config";
import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function Editor() {

    const navigate = useNavigate();
    const baseApiUrl = api_url

    useEffect(()=>{
        async function check() {
            const response = await axios.get(`${baseApiUrl}/verify`,{
                headers : {
                    Authorization : `Bearer ${localStorage.getItem("token") || ""}`
                }
            });
            if(!response) {
                //valid user 
                navigate('/login')
            }
        }
        check().then(()=>{
            console.log("verified user")
        }).catch((e)=>{
            console.log("unverified user");
            console.log(e);
            navigate('/login')
        })
    },[navigate,baseApiUrl])
    
    return <>
        <div className="min-h-screen flex">
            <RoomUserList/>
            <CodeEditor/>
        </div>
    </>
}