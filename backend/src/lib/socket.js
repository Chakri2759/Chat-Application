import {Server} from "socket.io";
import http from "http";
import express from "express";


const app = express();
const server = http.createServer(app);

// Get allowed origins from environment variable or use default
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ["http://localhost:5173"];

const io = new Server(server, {
    cors: {
        origin: function(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ["GET", "POST"],
        credentials: true
    },
    allowEIO3: true,
    transports: ["websocket", "polling"],
    pingTimeout: 60000,
    pingInterval: 25000,
    maxHttpBufferSize: 1e6 // 1MB
});

// To keep track of online users
const userSocketMap = new Map(); // Using Map instead of object for better memory management

const getReceiverSocketId = (userId) => {
    return userSocketMap.get(userId) || null;
}

io.on("connection", (socket) => {  
    console.log("New client connected", socket.id);
    
    // Add user to the map when they connect
    socket.on("setup", (userId) => {
        userSocketMap.set(userId, socket.id);
        io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected", socket.id);
        // Remove user from the map when they disconnect
        for (const [userId, socketId] of userSocketMap.entries()) {
            if (socketId === socket.id) {
                userSocketMap.delete(userId);
                break;
            }
        }
        io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
    });
});

export {io, server,app,getReceiverSocketId };

