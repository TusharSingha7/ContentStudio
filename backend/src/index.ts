import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import * as Y from 'yjs';
import {
    applyAwarenessUpdate,
    Awareness,
    encodeAwarenessUpdate,
    removeAwarenessStates
} from 'y-protocols/awareness.js';
// Import 'writeUpdate' which is crucial for broadcasting
import { readSyncMessage, writeSyncStep1, writeUpdate } from 'y-protocols/sync.js';

import {
    createEncoder,
    toUint8Array,
    writeVarUint,
    writeVarUint8Array,
    length as encodingLength
} from 'lib0/encoding.js';
import {
    createDecoder,
    readVarUint,
    readVarUint8Array
} from 'lib0/decoding.js';
import { PrismaClient } from '@prisma/client';
import { userDetailsSchema , projectDetailsSchema , chatDetailsSchema } from './types';
import jwt from 'jsonwebtoken'
import { authMiddleware } from './middleware';
import cors from 'cors'
import client from './db';

const messageSync = 0;
const messageAwareness = 1;

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
        
        // *** FIX STARTS HERE ***
        // When the document changes, broadcast the update to all connected clients
        doc.on('update', (update: Uint8Array, origin: WebSocket) => {
            const encoder = createEncoder();
            writeVarUint(encoder, messageSync);
            // Use writeUpdate to encode the update
            writeUpdate(encoder, update);
            const message = toUint8Array(encoder);

            // Send the update to all connections except the origin
            connections.forEach((_, conn) => {
                if (conn !== origin) {
                    conn.send(message);
                }
            });
        });
        // *** FIX ENDS HERE ***

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
                const encoder = createEncoder();
                writeVarUint(encoder, messageSync);
                // Pass `ws` as the origin. When `readSyncMessage` applies an update,
                // it will trigger the `doc.on('update')` listener and correctly pass `ws` as the origin.
                readSyncMessage(decoder, encoder, doc, ws);

                if (encodingLength(encoder) > 1) {
                    ws.send(toUint8Array(encoder));
                }
                break;
            }
            case messageAwareness: {
                // This correctly applies the awareness update to the central instance
                applyAwarenessUpdate(awareness, readVarUint8Array(decoder), ws);
                break;
            }
        }
    });

    const awarenessChangeHandler = ({ added, updated, removed }: { added: number[], updated: number[], removed: number[] }) => {
        const changedClients = added.concat(updated, removed);
        
        added.forEach(clientID => clientIDs.add(clientID));
        removed.forEach(clientID => clientIDs.delete(clientID));

        const encodedUpdate = encodeAwarenessUpdate(awareness, changedClients);
        const message = createEncoder();
        writeVarUint(message, messageAwareness);
        writeVarUint8Array(message, encodedUpdate);
        const finalMessage = toUint8Array(message);

        // Broadcast awareness changes to all clients
        connections.forEach((_, conn) => {
            conn.send(finalMessage);
        });
    };

    awareness.on('update', awarenessChangeHandler);

    ws.on('close', () => {
        console.log(`Client disconnected from document: ${docName}`);
        const statesToRemove = connections.get(ws);
        if (statesToRemove) {
            removeAwarenessStates(awareness, Array.from(statesToRemove), null);
            connections.delete(ws);
        }
    });
    
    // --- Initial Sync Handshake ---
    const syncEncoder = createEncoder();
    writeVarUint(syncEncoder, messageSync);
    writeSyncStep1(syncEncoder, doc);
    ws.send(toUint8Array(syncEncoder));

    // Send the current awareness state to the new client
    const awarenessStates = awareness.getStates();
    if (awarenessStates.size > 0) {
        const awarenessEncoder = createEncoder();
        writeVarUint(awarenessEncoder, messageAwareness);
        writeVarUint8Array(awarenessEncoder, encodeAwarenessUpdate(awareness, Array.from(awarenessStates.keys())));
        ws.send(toUint8Array(awarenessEncoder));
    }
});


// --- Server and other WebSocket handlers remain the same ---

const langWss = new WebSocketServer({ noServer: true });
langWss.on('connection', (ws: WebSocket) => {
    console.log('New client connected to /live-code');
    ws.on('message', (message: Buffer) => {
        console.log(`Received message on /live-code: ${message.toString()}`);
        const data = JSON.parse(message.toString());
        console.log('Parsed data:', data);
        langWss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
    ws.on('close', () => {
        console.log('Client disconnected from /live-code');
    });
});

server.on('upgrade', (request, socket, head) => {
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
    const token = jwt.sign({ id: user.id, email: user.email }, secret);
    res.status(201).json({ message: 'User created successfully', token : token });
})

app.post('/login',async (req,res)=>{
    const client = new PrismaClient();
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
    const token = jwt.sign({ id: user.id, email: user.email }, secret);
    res.status(200).json({ message: 'Login successful', token: token });
})

app.use(authMiddleware);

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

const PORT = Number(process.env.PORT) ||  3000;
    server.listen(PORT,'0.0.0.0', () => {
    console.log(`Listening on http://localhost:${PORT}`);
});