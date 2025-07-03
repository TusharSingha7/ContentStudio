import Header from "../components/header"
import SignIn from "../components/signin"
import Welcome from "../components/welcome"

export default function Login() {
    return <>
    <Header />
    <div className="min-h-full grid grid-cols-1 bg-grey-100 md:grid-cols-2">
        <SignIn/>
        <Welcome title={"Welcome Back!"} description={"Log in to collaborate, code, and stay in sync with your developer community."} />
    </div>
    </>
}