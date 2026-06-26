import {Server} from 'socket.io'
import 'dotenv/config'
import express from 'express'
import http from 'http'
const app=express();
const server=http.createServer(app);

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

const io = new Server(server, {
  cors: {
    // In development, allow any localhost port (Vite can pick 5173, 5174, etc.)
    origin: process.env.NODE_ENV === "production"
      ? allowedOrigin
      : /^http:\/\/localhost:\d+$/,
    credentials: true,
  },
});


//userId, socketId map
const userSocketMap={};

function getReceiverSocketId(userId){
    return userSocketMap[userId]
}

io.on("connection", (socket)=>{
    const userId=socket.handshake.query.userId;
    
    if(userId) userSocketMap[userId]=socket.id

    //io.emit send to event to everybody-> broadcasting
    io.emit('getOnlineUsers', Object.keys(userSocketMap))

    socket.on('disconnect', ()=>{
        if(userId) delete userSocketMap[userId];

        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    })
})

// {
//    "u101" : "abc123",   // Alice
//    "u102" : "xyz789",   // Bob
//    "u103" : "pqr456"    // Charlie
// }

// =>["u101", "u102", "u103"]

export {app, server, io, getReceiverSocketId}