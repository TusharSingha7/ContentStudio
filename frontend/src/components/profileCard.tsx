
import UserInfoCard from "./userInfo";

export default function ProfileCard() {
    return <>
    <div className="min-h-screen rounded bg-gray-100 flex items-center justify-center flex-col">
        <div>Profile</div>
        <div>Your Profile Information</div>
        <img></img>
        <div>click the camera icon to update your photo</div> 
        <UserInfoCard/>
    </div>
    </>
}