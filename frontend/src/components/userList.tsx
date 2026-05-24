import type { userDetails } from "../types";
import UserChat from "./userChat";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import logoutImage from "../assets/logout.png";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { chatList, selectedUser } from "@/store";
import { useNavigate } from "react-router";
import { api_url } from "@/config";
import { ListCache } from "@/cache/singletonClass";
import { jwtDecode } from "jwt-decode";

export default function UserChatList() {
  const [userList, setUserList] = useState<userDetails[]>(ListCache.getUsersList());
  const setUser = useSetRecoilState(selectedUser);
  const setChatList = useSetRecoilState(chatList);
  const navigate = useNavigate();
  const baseApiUrl = api_url;
  const userSelected = useRecoilValue(selectedUser);

  const logoutHandler = () => {
    localStorage.removeItem("token");
    ListCache.clearCache();
    navigate("/login");
  };

  useEffect(() => {
    async function listFetcher() {
      if (ListCache.getUsersList().length > 0) {
        setUserList(ListCache.getUsersList());
        return;
      }
      const response = await axios.get(`${baseApiUrl}/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      if (response) {
        const token = localStorage.getItem("token");
        const currentUserId = token ? jwtDecode<{ id: number }>(token).id : null;
        const filteredUsers = response.data.users.filter(
          (user: userDetails) => user.id !== currentUserId
        );
        ListCache.setUsersList(filteredUsers);
        setUserList(filteredUsers);
      }
    }
    listFetcher()
      .catch((e) => {
        console.log("caught error");
        console.log(e);
      });
  }, [baseApiUrl]);
  return (
    <>
      <div className="flex flex-col bg-[#222831] relative min-w-[220px]">
        <div className="w-full max-w-sm min-w-full px-4 pt-4">
          <div className="relative flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="absolute w-5 h-5 top-2.5 left-2.5 text-white"
            >
              <path
                fillRule="evenodd"
                d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"
                clipRule="evenodd"
              />
            </svg>

            <input
              className="w-full bg-transparent placeholder:text-slate-400 text-white text-sm border border-[#393E46] rounded-md pl-10 pr-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
              placeholder="search users ..."
            />
          </div>
        </div>
        <div className="border-y border-[#393E46] my-3 px-4 py-2 flex items-center">
          <Checkbox
            className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 
                     data-[state=checked]:text-white data-[state=unchecked]:border-[#393E46]"
          />
          <span className="ml-2 text-sm text-gray-400">
            Show Online Users Only
          </span>
        </div>
        <div className="flex flex-col gap-2 px-2 overflow-y-auto h-[calc(100vh-250px)] custom-scrollbar">
          {userList.map((user) => {
            return (
              <button
                className="w-full inline-block"
                key={user.id}
                onClick={() => {
                  if (user.id !== userSelected?.id) {
                    setChatList(() => {
                      return [];
                    });
                    setUser(() => {
                      return user;
                    });
                  }
                }}
              >
                <UserChat
                  id={user.id}
                  name={user.name}
                  status={user.status}
                  color="bg-[#0D7500]"
                />
              </button>
            );
          })}
        </div>
        <div className="px-4 text-gray-400 text-sm">
          <Button
            className="hover:brightness-100 border border-[#393E46] w-full py-2 mt-6 transition hover:bg-[#393e46] hover:text-white"
            variant="ghost"
            onClick={logoutHandler}
          >
            <img src={logoutImage} alt="Logout" className="w-4 h-4" />
            Log Out
          </Button>
        </div>
      </div>
    </>
  );
}
