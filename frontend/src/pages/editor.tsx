import CodeEditor from "@/components/codeEditor";
import RoomUserList from "@/components/roomList";

export default function Editor() {
    return <>
        <div className="min-h-screen flex">
            <RoomUserList/>
            <CodeEditor/>
        </div>
    </>
}