
import { type chatDetails, type userDetails } from "@/types";
import { atom } from "recoil";

export const selectedUser = atom<userDetails>({
    key : "selectedUser",
    default : {
        id : 0,
        name : "default",
        email : "",
        status : 'offline'
    }
});

export const chatSocket = atom<WebSocket | null>({
    key : "chatSocket",
    default : null
});

export const chatList = atom<chatDetails[]>({
    key : "chatList",
    default : []
});