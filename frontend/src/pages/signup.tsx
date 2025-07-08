
import Header from "../components/header"
import SignUp from "../components/signup"
import Welcome from "../components/welcome"
import { useNavigate } from "react-router"
import axios from "axios"
import { api_url } from "@/config"
import { useEffect } from "react"

export default function SignUpPage() {
    
    const baseApiUrl = api_url
    const navigate = useNavigate();

    useEffect(()=> {
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
            navigate('/');
        }).catch(()=>{
            console.log("unverified user");
        })
    },[navigate , baseApiUrl])
    return <>
    <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 bg-red-100">
            <SignUp />
            <Welcome
                title="Join our community!"
                description="Connect with fellow developers, share code, and build together in real time."
            />
        </div>
    </div>
    </>
}