
import Header from "../components/header"
import SignUp from "../components/signup"
import Welcome from "../components/welcome"

export default function SignUpPage() {
    return <>
    <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 bg-red-100">
            <SignUp />
            <Welcome
                title="Join our community!"
                description="Connect with fellow developers, share code, and build together in real time."
            />
        </div>
    </div>
    </>
}