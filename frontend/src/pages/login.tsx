import { useEffect } from "react"
import Header from "../components/header"
import SignIn from "../components/signin"
import Welcome from "../components/welcome"
import { useNavigate } from "react-router"
import axios from "axios"
import { api_url } from "@/config"

export default function Login() {

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
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 bg-gray-100">
                <SignIn />
                <Welcome
                    title="Welcome Back!"
                    description="Log in to collaborate, code, and stay in sync with your developer community."
                />
            </div>
        </div>
    )
}