
import Header from "../components/header"
import SignUp from "../components/signup"
import Welcome from "../components/welcome"

export default function SignUpPage() {
    return <>
    <Header />
    <div className="min-h-full grid grid-cols-1 bg-grey-100 md:grid-cols-2">
        <SignUp/>
        <Welcome title={"Join our community"} description={"Connect with fellow developers, share code, and build together in real time."} />
    </div>
    </>
}