import CodeEditor from "@/components/codeEditor";
import RoomUserList from "@/components/roomList";
import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function Editor() {

    const navigate = useNavigate();

    useEffect(()=>{
        async function check() {
            const response = await axios.get('http://localhost:3000/verify',{
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
    },[navigate])
    
    return <>
        <div className="min-h-screen flex">
            <RoomUserList/>
            <CodeEditor/>
        </div>
    </>
}