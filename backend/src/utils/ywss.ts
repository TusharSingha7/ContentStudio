import { WebSocket } from "ws";
import * as Y from "yjs";
import { yjsSocketMap, yjsSocketUserMap, docsMap } from "./configs.js";

export function addUserToDoc(ws: WebSocket, roomId: string) {
  if (!docsMap.has(roomId)) {
    docsMap.set(roomId, new Y.Doc());
  }
  yjsSocketUserMap.set(ws, roomId);
  if (!yjsSocketMap.has(roomId)) {
    yjsSocketMap.set(roomId, new Set<WebSocket>());
  }
  yjsSocketMap.get(roomId)?.add(ws);
}

export function removeUserFromDoc(ws: WebSocket, roomId: string) {
  const sockets = yjsSocketMap.get(roomId);
  if (sockets?.has(ws)) {
    sockets.delete(ws);
  }

  if (sockets && sockets.size === 0) {
    yjsSocketMap.delete(roomId);
    docsMap.delete(roomId);
  }

  if (yjsSocketUserMap.has(ws)) {
    yjsSocketUserMap.delete(ws);
  }
}
