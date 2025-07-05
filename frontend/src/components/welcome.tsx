import codingImage from "../assets/coding.png";

export default function Welcome({title , description} : {
    title: string;
    description: string;
}) {
    return (<>
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-r from-emerald-900 to-slate-900">
        <div className="text-green-500 font-bold text-4xl">{title}</div>
        <div className="text-sm text-gray-400 text-center p-4" >{description} </div>
        <img src={codingImage} className="h-32 w-32" />
        <div className="text-green-500 text-lg font-semibold mt-4 p-4 bg-[#222831] text-center rounded">
            <p>{`function helloWorld() {`}</p>
            <p>{`console.log("Hello, Developer 👨‍💻👩‍💻");`}</p>
            <p>{`}`}</p>
        </div>
    </div>
    </>)
}