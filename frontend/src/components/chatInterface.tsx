import ChatTopBar from "./chatTopBar";
import ChatControls from "./chatControls";
import ChatList from "./chatList";

export default function ChatInterface() {
    return <>
        <ChatTopBar/>
        <ChatList/>
        <ChatControls/>
    </>
}