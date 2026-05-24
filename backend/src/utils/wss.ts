import { WebSocket } from "ws";
import { userDetails, ChatDetailsSchema } from "../types/types.js";
import client from "../db/index.js";
import {
  userSocketMap,
  userRoomMap,
  userDetailsMap,
  usersInRoomMap,
  socketUserMap,
  liveCodeCodes,
} from "./configs.js";

export function userAddHandler(data: any, ws: WebSocket) {
  const userD: userDetails = data.data.userDetails;
  const roomId: string = data.data.roomId;

  if (!usersInRoomMap.has(roomId)) {
    usersInRoomMap.set(roomId, new Set<number>());
  }

  userRoomMap.set(userD.id, roomId);
  userSocketMap.set(userD.id, ws);
  userDetailsMap.set(userD.id, userD);
  socketUserMap.set(ws, userD.id);

  const listOfUsersInRoom = usersInRoomMap.get(roomId)!;
  if (!listOfUsersInRoom.has(userD.id)) {
    listOfUsersInRoom.add(userD.id);
    usersInRoomMap.set(roomId, listOfUsersInRoom);
  }

  const listOfUserDetails: userDetails[] = [];
  for (const value of listOfUsersInRoom) {
    const detailsOfUser = userDetailsMap.get(value);
    if (detailsOfUser) {
      listOfUserDetails.push({
        ...detailsOfUser,
        status: "online",
      });
    }
  }

  for (const value of listOfUsersInRoom) {
    const socket = userSocketMap.get(value);
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          code: liveCodeCodes.roomPresenceUpdate,
          data: listOfUserDetails,
        })
      );
    }
  }
}

export async function chatHandler(data: any, ws: WebSocket) {
  const msg = data.data;
  const sender = msg.userDetails;
  const receiver = msg.selectedUser;
  const messageString =
    typeof msg.message === "string" ? msg.message : JSON.stringify(msg.message);
  const chat: ChatDetailsSchema = {
    creatorId: sender.id,
    receiverId: receiver.id,
    message: messageString,
  };

  const chatR = await client.chat.create({
    data: {
      creatorId: chat.creatorId,
      receiverId: chat.receiverId,
      message: chat.message,
      seen: false,
    },
  });

  if (userSocketMap.has(receiver.id)) {
    const socket = userSocketMap.get(receiver.id);

    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          code: liveCodeCodes.chatMessageReceive,
          data: chatR,
        })
      );
    }
  }

  ws.send(
    JSON.stringify({
      code: liveCodeCodes.chatMessageReceive,
      data: chatR,
    })
  );
}

export async function chatListHandler(data: any, ws: WebSocket) {
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
      code: liveCodeCodes.chatHistoryResponse,
      data: list,
    })
  );
}

export function userExitHandler(ws: WebSocket) {
  const clientId = socketUserMap.get(ws);
  if (!clientId) return;

  userDetailsMap.delete(clientId);
  userSocketMap.delete(clientId);
  socketUserMap.delete(ws);

  const roomId = userRoomMap.get(clientId);
  if (!roomId) return;

  userRoomMap.delete(clientId);
  const listOfUsersInRoom = usersInRoomMap.get(roomId);
  if (!listOfUsersInRoom) return;

  listOfUsersInRoom.delete(clientId);

  if (listOfUsersInRoom.size === 0) {
    usersInRoomMap.delete(roomId);
    return;
  }

  const listOfUserDetails: userDetails[] = [];
  for (const value of listOfUsersInRoom) {
    const userD = userDetailsMap.get(value);
    if (userD) {
      listOfUserDetails.push({
        ...userD,
        status: "online",
      });
    }
  }

  for (const value of listOfUsersInRoom) {
    const socket = userSocketMap.get(value);
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          code: liveCodeCodes.roomPresenceUpdate,
          data: listOfUserDetails,
        })
      );
    }
  }
}
