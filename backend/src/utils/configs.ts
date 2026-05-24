import { userDetails, chat } from "../types/types.js";
import WebSocket from "ws";

import type { Doc } from "yjs";

// list socket maps
export const usersInRoomMap = new Map<string, Set<number>>();
export const userRoomMap = new Map<number, string>();
export const userSocketMap = new Map<number, WebSocket>();
export const userDetailsMap = new Map<number, userDetails>();
export const roomChatsMap = new Map<string, chat[]>();
export const socketUserMap = new Map<WebSocket, number>();

// yjs maps
export const docsMap = new Map<string, Doc>();
export const yjsSocketMap = new Map<string, Set<WebSocket>>();
export const yjsSocketUserMap = new Map<WebSocket, string>();

// message codes
export const liveCodeCodes = {
  userHandshakeRequest: 100,
  roomJoin: 101,
  roomPresenceUpdate: 102,
  chatHistoryRequest: 200,
  chatHistoryResponse: 201,
  chatMessageSend: 202,
  chatMessageReceive: 203,
} as const;
