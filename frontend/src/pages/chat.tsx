import DefaultChatInterface from "@/components/defaultChatInterface";
import Header from "@/components/header";
import UserChatList from "@/components/userList";
import ChatInterface from "@/components/chatInterface";

export default function Chat() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="flex-1 grid grid-cols-2 grid-cols-[30%_70%] bg-[#222831]">
                <UserChatList/>
                <ChatInterface />
            </div>
        </div>
    );
}