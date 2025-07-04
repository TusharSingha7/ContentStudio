import Header from "../components/header"
import SignIn from "../components/signin"
import Welcome from "../components/welcome"

export default function Login() {
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