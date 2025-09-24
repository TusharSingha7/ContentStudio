import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { createYjsServer } from 'yjs-server';

import { userDetailsSchema , projectDetailsSchema , chatDetailsSchema } from './types/types';
import jwt from 'jsonwebtoken'
import { authMiddleware, errorHandler } from './middleware';
import cors from 'cors'
import client from './db';
import { chatListRequestCode, liveChatRequestCode , socketUserMap, userDetailsAddCode, userDetailsRequestCode } from './utils/configs';
import { chatHandler, userAddHandler, userExitHandler, chatListHandler } from './utils/wss';

import { userDetailsMap , docsMap } from './utils/configs'
import { addUserToDoc, removeUserFromDoc } from './utils/ywss';

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

const app = express();
// creaitng a http server 
const server = createServer(app);
// creating a yjs web socket server

app.use(cors());
app.use(express.json());

const yjsWss = new WebSocketServer({ noServer: true});

yjsWss.on('connection',(ws:WebSocket , req)=> {

    const roomId = req.url?.slice(1).split("?")[0] || "default";

    addUserToDoc(ws , roomId);

    const doc = docsMap.get(roomId)!;
    if(!doc) {
        ws.close();
        return;
    }

    const yjss = createYjsServer({
      createDoc: () => {
        return doc;
      },
    });

    yjss.handleConnection(ws,req);

    ws.on('close',()=>{
        removeUserFromDoc(ws,roomId);
    })
})

const wss = new WebSocketServer({ noServer: true});

wss.on('connection', (ws: WebSocket ) => {
    try{
        const requestUserDetails = {
            code : userDetailsRequestCode,
            data : {

            }
        }
        ws.send(JSON.stringify(requestUserDetails))

        console.log("connection to normal websocket established")

        ws.on('message', (message) => {
            console.log("received message on the normal websocket");
            console.log(message);
            console.log(typeof(message));
            const data = JSON.parse(message.toString());
            console.log(data);
            console.log("data is ");
           
            switch (data.code) {

                case userDetailsAddCode: 
                    userAddHandler(data , ws);
                    break;
                case chatListRequestCode:
                    chatListHandler(data , ws);
                    break;
                case liveChatRequestCode:
                    chatHandler(data , ws);
                    break;
            }
            
        });
        ws.on('close', (code , reason)=> {
            const userId = socketUserMap.get(ws);
            const userD = userDetailsMap.get(userId!);
            console.log("connection closing " , userD)
            userExitHandler(ws);
        });

        ws.on('error',(error)=>{
            console.log(error);
        })

    }
    catch(e){
        console.log(e);
    }

});

server.on('upgrade', (request, socket, head) => {
    try {
        const pathname = request.url;
        if (pathname?.startsWith('/yjs')) {
            yjsWss.handleUpgrade(request, socket, head, (ws) => {
              yjsWss.emit("connection", ws, request);
            });
        }
        else if (pathname?.startsWith('/live-code')) {
            wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit('connection', ws , request);
            });
        } 
        else {
            socket.destroy();
        }
    }
    catch(err){
        console.log(err);
        return;
    }
});

app.post('/user',async (req,res) =>{
    const data = req.body;

    const parsedUserDetails = userDetailsSchema.safeParse(data);
    if(!parsedUserDetails.success) {
        res.status(400).json({ error: parsedUserDetails.error.errors });
        return;
    }
    const userDetails = parsedUserDetails.data;
    const user = await client.user.create({
        data: {
            name: userDetails.name,
            email: userDetails.email,
            status: "offline",
            password: userDetails.password
        }
    });
    const secret = process.env.JWT_SECRET || "your_jwt_secret";
    const token = jwt.sign({ id: user.id, email: user.email , name : user.name }, secret);
    res.status(201).json({ message: 'User created successfully', token : token });
})

app.post('/login',async (req,res)=>{
    const data = req.body;
    const email = data.email;
    const password = data.password;

    const user = await client.user.findUnique({
        where: { email: email }
    });
    if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
    }
    if (user.password !== password) {
        res.status(401).json({ error: 'Invalid password' });
        return;
    }
    //return a jwt
    const secret = process.env.JWT_SECRET || "your_jwt_secret";
    const token = jwt.sign({ id: user.id, email: user.email , name: user.name}, secret);
    res.status(200).json({ message: 'Login successful', token: token });
})

app.use(authMiddleware);

app.post('/project',async (req,res)=>{
    const data = req.body;
    const parsedProject = projectDetailsSchema.safeParse(data);
    if(!parsedProject.success) {
        res.status(404).json({message : "invalid project format"})
        return;
    }
    await client.project.create({
        data : {
            title : parsedProject.data.title,
            description : parsedProject.data.title,
            userId : parsedProject.data.userId
        }
    });
    res.status(201).json({message : "project created"});
    return;
});

app.get('/users',async (req,res)=> {
    const users = await client.user.findMany({
        select : {
            id : true,
            email : true,
            name : true,
            status : true
        }
    });
    res.status(200).json({users});
    return;
})

app.get('/', (req, res) => {
    res.send('Hello—WS server up on /yjs and /live-code');
    return;
});

app.get('/chats',async (req,res)=>{
    const senderId = parseInt(req.query.senderId as string);
    const receiverId = parseInt(req.query.receiverId as string);
    const chats = await client.chat.findMany({
        where: {
            OR: [
                { creatorId: senderId , receiverId: receiverId },
                { receiverId: senderId , creatorId: receiverId }
            ]
        }
    });
    res.status(200).json(chats);
})

app.post('/chat',async (req,res)=>{
    const data = req.body;
    const parsedChatDetails = chatDetailsSchema.safeParse(data);
    if(!parsedChatDetails.success) {
        res.status(400).json({ error: parsedChatDetails.error.errors });
        return;
    }
    const chatDetails = parsedChatDetails.data;
    await client.chat.create({
        data: {
            creatorId: chatDetails.creatorId,
            receiverId: chatDetails.receiverId,
            message: chatDetails.message,
            seen: false
        }
    });
    res.status(201).json({ message: 'Chat created successfully' });
})

app.get('/projects',async (req,res)=>{
    const userId = (req as any).user.id;
    const projects = await client.project.findMany({
        where: { userId: userId }
    });
    res.status(200).json(projects);
})

app.get('/verify',(req,res)=>{
    res.status(200).json({message : "verified user"})
    return;
})

app.use(errorHandler);

const PORT = 3000;
server.listen(PORT,'0.0.0.0', () => {
console.log(`Listening on http://localhost:${PORT}`);
});