import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

const PORT = 5000;

const app = express();

// raw server
const server = createServer(app);

// creating instant of server which means circuit creation
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});


// middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);


// show all sockets
let connectedUsers = new Set();


io.on("connection",(socket) => {
  console.log(`User Connected : ${socket.id}`);
  connectedUsers.add(socket.id);


  // trigger the event
  // socket.emit("welcome","Hello bhai!😊")
  
  
  // handle all the event
  socket.on("messages",({messages,room}) => {
    console.log(messages);

    // io.emit('msg',msg); // all can see the msg
    // socket.emit('msg',msg);// sender will only see the message

    // if not using private room
    // broadcast to other
    // socket.broadcast.emit("bm",messages);

    // other see the message :- private
    // io.to(room).emit('msg',messages)

    // socket.to - will ensure that only other socket will seen that message    
    socket.to(room).emit("msg",messages);

  })

  // Send all connected socket IDs to the client who asked
  socket.on("get-all-users", () => {
    socket.emit("all-users", Array.from(connectedUsers));
  });


  // handle group chats socket 
  socket.on("group-chat",(roomName) => {
    socket.join(roomName);
    console.log(`User joined :${roomName}`)
  })

  // handle public chats
  socket.on("public-chat",(data) => {
    io.emit("public-message",data);
  })

  // at the time of unmounting the user will disconnect
  socket.on("disconnect",() => {
    console.log(`User Is Now DISCONNECTED: ${socket.id}` );
  })
})

app.use("/", (req, res) => {
  res.json("Hello World");
});


// app to server
server.listen(PORT, () => {
  console.log(`Server is Running on PORT: ${PORT}`);
});
