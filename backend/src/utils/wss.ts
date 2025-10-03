import { WebSocket } from "ws";
import {
  userDetails,
  ChatDetailsSchema,
} from "../types/types.js";
import client from "../db/index.js";
import {
  userSocketMap,
  userRoomMap,
  roomChatsMap,
  userDetailsMap,
  usersInRoomMap,
  socketUserMap,
} from "./configs.js";

export function userAddHandler(data: any, ws: WebSocket) {
  console.log("logging from userAddHandler");

  const userD: userDetails = data.data.userDetails;
  const roomId: string = data.data.roomId;

  if (!usersInRoomMap.has(roomId)) {
    usersInRoomMap.set(roomId, new Set<number>());
    roomChatsMap.set(roomId, []);
  }

  userRoomMap.set(userD.id, roomId);
  userSocketMap.set(userD.id, ws);
  userDetailsMap.set(userD.id, userD);
  socketUserMap.set(ws, userD.id);

  console.log(userD);

  const listOfUsersInRoom = usersInRoomMap.get(roomId)!;
  if (!listOfUsersInRoom.has(userD.id)) {
    listOfUsersInRoom.add(userD.id);
    usersInRoomMap.set(roomId, listOfUsersInRoom);
  }
  console.log(listOfUsersInRoom);
  // creating the set of userDetails
  const listOfUserDetails: userDetails[] = [];
  for (const value of listOfUsersInRoom) {
    const detailsOfUser = userDetailsMap.get(value)!;
    listOfUserDetails.push(detailsOfUser);
  }
  console.log("pusihing the lst");
  for (const value of listOfUsersInRoom) {
    const detailsOfUser = userDetailsMap.get(value)!;
    console.log(detailsOfUser);
    const socket = userSocketMap.get(detailsOfUser.id);
    if (socket?.readyState == socket?.OPEN) {
      console.log("pushed to ", detailsOfUser.id);
      //send the whole list
      socket?.send(
        JSON.stringify({
          code: 2,
          data: listOfUserDetails,
        })
      );
    }
  }
  console.log("logging from userAddHandler Finished");
}

export async function chatHandler(data: any, ws: WebSocket) {
  console.log("logging from chatHandler testing");
  const msg = data.data;
  const sender = msg.userDetails;
  const receiver = msg.selectedUser;
  const chat: ChatDetailsSchema = {
    creatorId: sender.id,
    receiverId: receiver.id,
    message: msg.message,
  };

  const str = JSON.stringify(chat.message);
  const chatR = await client.chat.create({
    data: {
      creatorId: chat.creatorId,
      receiverId: chat.receiverId,
      message: str,
      seen: false,
    },
  });

  if (userSocketMap.has(receiver.id)) {
    console.log("receiver connected id : " , receiver.id);
    const socket = userSocketMap.get(receiver.id);

    if (socket?.readyState == socket?.OPEN) {
      console.log("sent to receiver");
      socket?.send(
        JSON.stringify({
          code: 6,
          data: chatR,
        })
      );
    }
  }
  else {
    console.log("receiver not connected");
  }
  ws.send(
    JSON.stringify({
      code: 6,
      data: chatR,
    })
  );
  console.log("logging from chatHandler Finished testing");
}

export async function chatListHandler(data: any, ws: WebSocket) {
  console.log("logging from chatListHandler");

  userSocketMap.set(data.data.userDetails.id, ws);
  socketUserMap.set(ws, data.data.userDetails.id);

  const msg = data.data;
  const senderId = msg.userDetails.id;
  const receiverId = msg.selectedUser.id;
  const list = await client.chat.findMany({
    where: {
      OR: [
        { creatorId: senderId, receiverId: receiverId },
        { receiverId: senderId, creatorId: receiverId },
      ],
    },
  });
  ws.send(
    JSON.stringify({
      code: 4,
      data: list,
    })
  );
  console.log("logging from chatlistHander Finished");
}

export function userExitHandler(ws: WebSocket) {
  console.log("logging from useExitHandler");
  const clientId = socketUserMap.get(ws);
  console.log("exiting");
  console.log(clientId);
  if (!clientId) return;
  userDetailsMap.delete(clientId);
  const roomId = userRoomMap.get(clientId);
  if (!roomId) return;
  userRoomMap.delete(clientId);
  if (usersInRoomMap.has(roomId)) {
    usersInRoomMap.get(roomId)?.delete(clientId);
  }
  if (userSocketMap.has(clientId)) userSocketMap.delete(clientId);
  socketUserMap.delete(ws);
  // create an updated list and push to all users
  const listOfUsersInRoom = usersInRoomMap.get(roomId)!;
  const listOfUserDetails: userDetails[] = [];

  for (const value of listOfUsersInRoom) {
    const userD = userDetailsMap.get(value)!;

    if (userD) {
      listOfUserDetails.push(userD);
    }
  }

  for (const value of listOfUsersInRoom) {
    const socket = userSocketMap.get(value);
    if (socket && socket.readyState === WebSocket.OPEN) {
    }
  }

  for (const value of listOfUsersInRoom) {
    const detailsOfUser = userDetailsMap.get(value)!;
    const socket = userSocketMap.get(detailsOfUser.id);
    if (socket?.readyState == socket?.OPEN) {
      //send the whole list
      socket?.send(
        JSON.stringify({
          code: 2,
          data: listOfUserDetails,
        })
      );
    }
  }

  console.log("Client disconnected from /live-code");
  console.log("logging from userExitHandeler Finished");
}
