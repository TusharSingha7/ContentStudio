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
  if (yjsSocketMap.has(roomId)) {
    if (yjsSocketMap.get(roomId)?.has(ws)) {
      yjsSocketMap.get(roomId)?.delete(ws);
    }
  }
  if (yjsSocketUserMap.has(ws)) {
    yjsSocketUserMap.delete(ws);
  }
}
