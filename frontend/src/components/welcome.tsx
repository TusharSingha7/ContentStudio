

export default function Welcome({title , description} : {
    title: string;
    description: string;
}) {
    return (<>
    <div className="flex items-center justify-center h-full bg-gray-100">
        <div>{title}</div>
        <div>{description} </div>
        <div> will render image here in future </div>
        <div>
            {` function helloWorld() {
            console.log("Hello, Developer 👨‍💻👩‍💻");
            }`}
        </div>
    </div>
    </>)
}