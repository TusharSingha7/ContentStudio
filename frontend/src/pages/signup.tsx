
import Header from "../components/header"
import SignUp from "../components/signup"
import Welcome from "../components/welcome"

export default function SignUpPage() {
    return <>
    <div className="min-h-screen flex flex-col">
                <Header />
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 bg-gray-100">
                    <div className="min-h-screen md:min-h-0 flex items-center justify-center">
                        <SignUp />
                    </div>
                    <div className="min-h-screen md:min-h-0 flex items-center justify-center">
                        <Welcome
                            title="Welcome Back!"
                            description="Log in to collaborate, code, and stay in sync with your developer community."
                        />
                    </div>
                </div>
            </div>
    </>
}