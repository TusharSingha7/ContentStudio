import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import * as Y from 'yjs';
import { applyAwarenessUpdate , Awareness , encodeAwarenessUpdate , removeAwarenessStates } from 'y-protocols/awareness';

import { readSyncMessage, writeSyncStep1, writeUpdate } from 'y-protocols/sync';

import {createEncoder,toUint8Array,writeVarUint,writeVarUint8Array,length as encodingLength} from 'lib0/encoding.js';
import {createDecoder,readVarUint,readVarUint8Array} from 'lib0/decoding.js';
import { userDetailsSchema , projectDetailsSchema , chatDetailsSchema, ChatDetails } from './types';
import jwt from 'jsonwebtoken'
import { authMiddleware, errorHandler } from './middleware';
import cors from 'cors'
import client from './db';

const messageSync = 0;
const messageAwareness = 1;

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

interface DocData {
    doc: Y.Doc;
    awareness: Awareness;
    connections: Map<WebSocket, Set<number>>;
}

const docs = new Map<string, DocData>();

// This function is now responsible for setting up the broadcast listeners
function getYDoc(docName: string): DocData {
    if (!docs.has(docName)) {
        const doc = new Y.Doc();
        const awareness = new Awareness(doc);
        const connections = new Map<WebSocket, Set<number>>();

        doc.on('update', (update: Uint8Array, origin: any) => {
            const encoder = createEncoder();
            writeVarUint(encoder, messageSync);
            writeUpdate(encoder, update);
            const message = toUint8Array(encoder);

            connections.forEach((_, conn) => {
                // Send to everyone except the originator
                if (conn !== origin) {
                    conn.send(message);
                }
            });
        });
        
        // This listener is now created only ONCE per document.
        awareness.on('update', ({ added, updated, removed }: { added: number[], updated: number[], removed: number[] }) => {
            const changedClients = added.concat(updated, removed);
            const encoder = createEncoder();
            writeVarUint(encoder, messageAwareness);
            writeVarUint8Array(encoder, encodeAwarenessUpdate(awareness, changedClients));
            const message = toUint8Array(encoder);

            connections.forEach((_, conn) => {
                conn.send(message);
            });
        });

        docs.set(docName, { doc, awareness, connections });
    }
    return docs.get(docName)!;
}

const app = express();
const server = createServer(app);
const yjsWss = new WebSocketServer({ noServer: true });

app.use(cors());
app.use(express.json());

yjsWss.on('connection', (ws, req) => {
    try {
        const docName = req.url?.slice(1).split('?')[0] || 'default';
        const { doc, awareness, connections } = getYDoc(docName);

        console.log(`Client connected to document: ${docName}`);
        
        const clientIDs = new Set<number>();
        connections.set(ws, clientIDs);

        ws.on('message', (message: Buffer) => {
            const decoder = createDecoder(message);
            const messageType = readVarUint(decoder);

            switch (messageType) {
                case messageSync: {
                    // Apply document updates from the client
                    const encoder = createEncoder();
                    writeVarUint(encoder, messageSync);
                    readSyncMessage(decoder, encoder, doc, ws);

                    if (encodingLength(encoder) > 1) {
                        ws.send(toUint8Array(encoder));
                    }
                    break;
                }
                case messageAwareness: {
                    // Apply awareness updates from the client to the central awareness instance
                    applyAwarenessUpdate(awareness, readVarUint8Array(decoder), ws);
                    break;
                }
            }
        });

        ws.on('close', () => {
            console.log(`Client disconnected from document: ${docName}`);
            const controlledIds = connections.get(ws);
            connections.delete(ws);

            if (controlledIds) {
                removeAwarenessStates(awareness, Array.from(controlledIds), null);
            }
        });
        // 1. Send the current document state to the new client
        const syncEncoder = createEncoder();
        writeVarUint(syncEncoder, messageSync);
        writeSyncStep1(syncEncoder, doc);
        ws.send(toUint8Array(syncEncoder));

        // 2. Send the current awareness state of all other users to the new client
        const awarenessStates = awareness.getStates();
        if (awarenessStates.size > 0) {
            const awarenessEncoder = createEncoder();
            writeVarUint(awarenessEncoder, messageAwareness);
            writeVarUint8Array(awarenessEncoder, encodeAwarenessUpdate(awareness, Array.from(awarenessStates.keys())));
            ws.send(toUint8Array(awarenessEncoder));
        }
    }
    catch (err) {
        console.error(err);
    }
});

interface userDetails {
    id : number,
    email : string,
    name : string,
    iat : number
}

const userSet = new Set<userDetails>();
const userRoom = new Map<number,string>();
const roomList = new Map<string,Set<userDetails>>();
const socketUserMap = new Map<WebSocket,userDetails>();
const userSocketMap = new Map<number,WebSocket>();

const langWss = new WebSocketServer({ noServer: true , verifyClient: (info, done) => done(true) });
langWss.on('connection', (ws: WebSocket , req) => {
    try{
    console.log('New client connected to /live-code');
    ws.send(JSON.stringify({
        code : 1,
    }))
    ws.on('message',async  (message: Buffer) => {
        // console.log(`Received message on /live-code: ${message.toString()}`);
        const data = JSON.parse(message.toString());
        if(data.code == 1) {
            //user details came add to room and live list
            const userD : userDetails = data.data.userDetails;
            const roomId : string = data.data.roomId;
            if(!roomList.has(roomId)) roomList.set(roomId,new Set<userDetails>());
            roomList.get(roomId)?.add(userD);
            userRoom.set(userD.id,roomId);
            userSet.add(userD);
            socketUserMap.set(ws,userD);
            userSocketMap.set(userD.id,ws);
            console.log(userD);
            const roomSet = roomList.get(roomId)!;
            for(const value of roomSet){
                const socket = userSocketMap.get(value.id);
                if(socket?.readyState == socket?.OPEN) {
                    //send the whole list 
                    socket?.send(JSON.stringify({
                        code : 2,
                        data : Array.from(roomSet)
                    }))
                }
            }
        }
        else if(data.code == 6) {
            const msg = data.data;
            const sender = msg.userDetails;
            const receiver = msg.selectedUser;
            const chat : ChatDetails = {
                creatorId : sender.id,
                receiverId : receiver.id,
                message : msg.message
            }
            
            const str = JSON.stringify(chat.message)
            const chatR  = await client.chat.create({
                data : {
                    creatorId : chat.creatorId,
                    receiverId : chat.receiverId,
                    message : str
                }
            });
            if(userSocketMap.has(receiver.id)) {
                const socket = userSocketMap.get(receiver.id);
                if(socket?.readyState == socket?.OPEN) {
                    socket?.send(JSON.stringify({
                        code : 6,
                        data : chatR
                    }))
                }
            }
            ws.send(JSON.stringify({
                code : 6,
                data : chatR
            }))
        }
        else if(data.code == 4) {
            const msg = data.data;
            const senderId = msg.userDetails.id;
            const receiverId = msg.selectedUser.id
            const list = await client.chat.findMany({
                where: {
                    OR: [
                        { creatorId: senderId , receiverId: receiverId },
                        { receiverId: senderId , creatorId: receiverId }
                    ]
                }
            });
            ws.send(JSON.stringify({
                code : 4,
                data : list
            }))
        }
        
    });
    ws.on('close', () => {
        const userD = socketUserMap.get(ws);
        console.log("exiting");
        console.log(userD);
        if(!userD) return;
        const userId = userD.id;
        userSet.delete(userD);
        const roomId = userRoom.get(userD.id);
        if(!roomId) return;
        if(roomList.has(roomId!)) {
            roomList.get(roomId)?.delete(userD);
        }
        if(userSocketMap.has(userId)) userSocketMap.delete(userId);
        langWss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    code : 2,
                    data : Array.from(userSet)
                }));
            }
        });
        console.log('Client disconnected from /live-code');
    });

    ws.on('error',(error)=>{
        console.log(error);
    })

    }catch(e){
        console.log(e);
    }
    
});

server.on('upgrade', (request, socket, head) => {
    try {
        const pathname = request.url;
        if (pathname?.startsWith('/yjs')) {
            yjsWss.handleUpgrade(request, socket, head, (ws) => {
                yjsWss.emit('connection', ws, request);
            });
        } else if (pathname?.startsWith('/live-code')) {
            langWss.handleUpgrade(request, socket, head, (ws) => {
                langWss.emit('connection', ws, request);
            });
        } else {
            socket.destroy();
    }
    }catch(err){
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
            message: chatDetails.message
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