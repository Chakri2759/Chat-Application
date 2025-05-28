import {Server} from "socket.io";
import http from "http";
import express from "express";


const app = express();
const server = http.createServer(app);
const io=new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"]
    },
    allowEIO3: true,
    transports: ["websocket", "polling"]
});
const getReceiverSocketId = (userId) => {
    return userSocketMap[userId] || null;
}
// To keep track of online users
const userSocketMap = {}; //{userid: socket.id}
    io.on("connection", (socket) => {  
        console.log("New client connected", socket.id);
        
        // Add user to the map when they connect
        socket.on("setup", (userId) => {
            userSocketMap[userId] = socket.id;
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected", socket.id);
            // Remove user from the map when they disconnect
            const userId = Object.keys(userSocketMap).find(key => userSocketMap[key] === socket.id);
            if (userId) {
                delete userSocketMap[userId];
            }
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        });
    
});

export {io, server,app,getReceiverSocketId };

