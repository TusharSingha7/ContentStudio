export const liveCodeCodes = {
  userHandshakeRequest: 100,
  roomJoin: 101,
  roomPresenceUpdate: 102,
  chatHistoryRequest: 200,
  chatHistoryResponse: 201,
  chatMessageSend: 202,
  chatMessageReceive: 203,
} as const;

export interface CodeChatMessage {
  type: 0 | 1;
  content: string;
}

export function parseChatMessage(message: string): CodeChatMessage {
  try {
    const parsed = JSON.parse(message) as Partial<CodeChatMessage>;
    if (
      (parsed.type === 0 || parsed.type === 1) &&
      typeof parsed.content === "string"
    ) {
      return parsed as CodeChatMessage;
    }
  } catch {
    // Fall through to plain-text fallback.
  }

  return {
    type: 1,
    content: message,
  };
}
