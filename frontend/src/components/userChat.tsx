

export default function UserChat({name = "Anonymous" , status} : {
    name : string,
    status : "online" | "offline"
}) {
    return <>
    <div className=" flex bg-yellow-300 h-12">
        <img></img>
        <div className="flex flex-col">
            {name}
            <span>
                {status}
            </span>
        </div>
    </div>
    </>
}