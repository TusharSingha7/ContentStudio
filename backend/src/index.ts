import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createYjsServer } from "yjs-server";

import {
  userDetailsSchema,
  projectDetailsSchema,
  chatDetailsSchema,
  ExecuteCodeRequest,
} from "./types/types.js";
import jwt from "jsonwebtoken";
import { authMiddleware, errorHandler } from "./middleware/index.js";
import cors from "cors";
import client from "./db/index.js";
import {
  liveCodeCodes,
  socketUserMap,
  userDetailsMap,
  docsMap,
} from "./utils/configs.js";
import {
  chatHandler,
  userAddHandler,
  userExitHandler,
  chatListHandler,
} from "./utils/wss.js";

import { addUserToDoc, removeUserFromDoc } from "./utils/ywss.js";

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

const pistonLanguageMap: Record<
  string,
  { language: string; version: string }
> = {
  javascript: { language: "javascript", version: "18.15.0" },
  typescript: { language: "typescript", version: "5.0.3" },
  python: { language: "python", version: "3.10.0" },
  java: { language: "java", version: "15.0.2" },
  cpp: { language: "c++", version: "10.2.0" },
  csharp: { language: "csharp", version: "6.12.0" },
};

const app = express();
// creaitng a http server
const server = createServer(app);
// creating a yjs web socket server

app.use(cors());
app.use(express.json());

const yjsWss = new WebSocketServer({ noServer: true });

yjsWss.on("connection", (ws: WebSocket, req) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  const roomId =
    url.pathname.replace(/^\/yjs\/?/, "").replace(/^\/+/, "") || "default";

  addUserToDoc(ws, roomId);

  const doc = docsMap.get(roomId);
  if (!doc) {
    ws.close();
    return;
  }

  const yjss = createYjsServer({
    createDoc: () => {
      return doc;
    },
  });

  yjss.handleConnection(ws, req);

  ws.on("close", () => {
    removeUserFromDoc(ws, roomId);
  });
});

const wss = new WebSocketServer({ noServer: true });

wss.on("connection", (ws: WebSocket) => {
  try {
    const requestUserDetails = {
      code: liveCodeCodes.userHandshakeRequest,
      data: {},
    };
    ws.send(JSON.stringify(requestUserDetails));

    ws.on("message", (message) => {
      const data = JSON.parse(message.toString());

      switch (data.code) {
        case liveCodeCodes.roomJoin:
          userAddHandler(data, ws);
          break;
        case liveCodeCodes.chatHistoryRequest:
          chatListHandler(data, ws);
          break;
        case liveCodeCodes.chatMessageSend:
          chatHandler(data, ws);
          break;
      }
    });
    ws.on("close", () => {
      const userId = socketUserMap.get(ws);
      const userD = userDetailsMap.get(userId!);
      console.log("connection closing ", userD);
      userExitHandler(ws);
    });

    ws.on("error", (error) => {
      console.log(error);
    });
  } catch (e) {
    console.log(e);
  }
});

server.on("upgrade", (request, socket, head) => {
  try {
    const pathname = request.url;
    if (pathname?.startsWith("/yjs")) {
      yjsWss.handleUpgrade(request, socket, head, (ws) => {
        yjsWss.emit("connection", ws, request);
      });
    } else if (pathname?.startsWith("/live-code")) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else {
      socket.destroy();
    }
  } catch (err) {
    console.log(err);
    return;
  }
});

app.post("/user", async (req, res) => {
  const data = req.body;

  const parsedUserDetails = userDetailsSchema.safeParse(data);
  if (!parsedUserDetails.success) {
    res.status(400).json({ error: parsedUserDetails.error.errors });
    return;
  }
  const userDetails = parsedUserDetails.data;
  const user = await client.user.create({
    data: {
      name: userDetails.name,
      email: userDetails.email,
      status: "offline",
      password: userDetails.password,
    },
  });
  const secret = process.env.JWT_SECRET || "your_jwt_secret";
  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    secret
  );
  res.status(201).json({ message: "User created successfully", token: token });
});

app.post("/login", async (req, res) => {
  const data = req.body;
  const email = data.email;
  const password = data.password;

  const user = await client.user.findUnique({
    where: { email: email },
  });
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  if (user.password !== password) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }
  //return a jwt
  const secret = process.env.JWT_SECRET || "your_jwt_secret";
  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    secret
  );
  res.status(200).json({ message: "Login successful", token: token });
});

app.use(authMiddleware);

app.post("/project", async (req, res) => {
  const data = req.body;
  const parsedProject = projectDetailsSchema.safeParse(data);
  if (!parsedProject.success) {
    res.status(404).json({ message: "invalid project format" });
    return;
  }
  await client.project.create({
    data: {
      title: parsedProject.data.title,
      description: parsedProject.data.description,
      userId: parsedProject.data.userId,
      link: parsedProject.data.link,
    },
  });
  res.status(201).json({ message: "project created" });
  return;
});

app.get("/users", async (req, res) => {
  const users = await client.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      status: true,
    },
  });
  res.status(200).json({ users });
  return;
});

app.get("/", (req, res) => {
  res.send("Hello—WS server up on /yjs and /live-code");
  return;
});

app.get("/chats", async (req, res) => {
  const senderId = parseInt(req.query.senderId as string);
  const receiverId = parseInt(req.query.receiverId as string);
  const chats = await client.chat.findMany({
    where: {
      OR: [
        { creatorId: senderId, receiverId: receiverId },
        { receiverId: senderId, creatorId: receiverId },
      ],
    },
  });
  res.status(200).json(chats);
});

app.post("/chat", async (req, res) => {
  const data = req.body;
  const parsedChatDetails = chatDetailsSchema.safeParse(data);
  if (!parsedChatDetails.success) {
    res.status(400).json({ error: parsedChatDetails.error.errors });
    return;
  }
  const chatDetails = parsedChatDetails.data;
  await client.chat.create({
    data: {
      creatorId: chatDetails.creatorId,
      receiverId: chatDetails.receiverId,
      message: chatDetails.message,
      seen: false,
    },
  });
  res.status(201).json({ message: "Chat created successfully" });
});

app.post("/execute", async (req, res, next) => {
  try {
    const body = req.body as ExecuteCodeRequest;
    const code = body.code?.trim();
    const runtime = pistonLanguageMap[body.language];

    if (!runtime) {
      res.status(400).json({ error: "Unsupported language" });
      return;
    }

    if (!code) {
      res.status(400).json({ error: "Code is required" });
      return;
    }

    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language: runtime.language,
        version: runtime.version,
        files: [
          {
            content: body.code,
          },
        ],
        stdin: body.input ?? "",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      res.status(502).json({
        error: "Piston execution failed",
        details: errorText,
      });
      return;
    }

    const result = await response.json();
    res.status(200).json({
      language: body.language,
      run: result.run ?? null,
      compile: result.compile ?? null,
    });
  } catch (error) {
    next(error);
  }
});

app.get("/projects", async (req, res) => {
  const userId = (req as any).user.id;
  const projects = await client.project.findMany({
    where: { userId: userId },
  });
  res.status(200).json(projects);
});

app.get("/verify", (req, res) => {
  res.status(200).json({ message: "verified user" });
  return;
});

app.use(errorHandler);

const PORT = 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
