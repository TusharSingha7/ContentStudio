
import Header from "@/components/header";
import UserChatList from "@/components/userList";
import ChatInterface from "@/components/chatInterface";
import { useEffect } from "react";
import { useRecoilState } from "recoil";
import { chatList, chatSocket } from "@/store";
import { useSetRecoilState } from "recoil";
import { api_url, websocket_url } from "@/config";
import { useNavigate } from "react-router";
import axios from "axios";

export default function Chat() {

    const [socket,setChatSocket] = useRecoilState(chatSocket);
    const setChatList = useSetRecoilState(chatList);
    const baseSocketUrl = websocket_url;
    const baseApiUrl = api_url;
    const navigate = useNavigate();

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
        if(!socket) {
            const newsocket = new WebSocket(`${baseSocketUrl}/live-code`);

            setChatSocket(newsocket)
            
            newsocket.addEventListener('open',()=>{
                console.log("chat socket connection estabished");
            });
            newsocket.onmessage = (message)=> {
                const msg = JSON.parse(message.data)
                console.log(message);
                if(msg.code == 4) {
                    //message list recieved render
                    setChatList(msg.data);
                }
                else if(msg.code == 6) {
                    console.log(msg.data)
                    setChatList((oldList)=>[...oldList,msg.data]);
                }
            }

            newsocket.addEventListener('close',()=>{
                console.log("chat websocket closed");
            })

            newsocket.addEventListener('error',(e)=>{
                console.log("chat socket error")
                console.log(e);
            })

            return ()=>{
                if (newsocket && newsocket.readyState === WebSocket.OPEN) {
                    newsocket.close();
                    console.log("chat socket cleaned up");
                }
            }

        }
    },[setChatSocket,socket,setChatList,baseSocketUrl,navigate,baseApiUrl])

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="flex-1 grid grid-cols-2 grid-cols-[30%_70%] bg-[#222831]">
                <UserChatList />
                <ChatInterface />
            </div>
        </div>
    );
}