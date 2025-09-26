import { userDetails, chat } from "../types/types";
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
export const userDetailsAddCode = 1;
export const chatListRequestCode = 4;
export const liveChatRequestCode = 6;
export const userDetailsRequestCode = 1;
