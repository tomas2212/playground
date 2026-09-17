import express from "express";
import {createServer} from "http";
import {Server} from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173", // React dev server
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    const interval = setInterval(() => {
        console.log("setInterval called");
        socket.emit("connected", socket.id);
        // io.emit("serverTimeInterval", {time: new Date().toISOString()});
        socket.emit("serverTimeInterval", {time: new Date().toISOString()});
    }, 5000);

    socket.on("message", (data) => {
        console.log("Received message from client:", data);
        // Odošli späť všetkým klientom
        // io.emit("message", `Server received: ${data}`);
        io.emit("message", data);
    });

    socket.on("disconnect", () => {
        clearInterval(interval);
        console.log("Client disconnected:", socket.id);
    });

    socket.onAny(() => {
        // triggered when the event is received
        console.log("An event was received from the client");
    });

    // TS issue
    // const listener = (...args) => {
    //   console.log(args);
    // }
    // socket.on("details", listener);

    socket.on("details", (...args) => {
        console.log(args);
    });

    // ...and then later...
    // socket.off("details", listener);
});

// app.post("/notify", (req, res) => {
//     io.emit("message", "📢 Notification from /notify endpoint");
// })

// Pridanie HTTP endpointu na simuláciu správy zo servera
// Prístupné na: http://localhost:3000/send?msg=Hello
app.get("/send", (req, res) => {
    const msg = req.query.msg as string || "Hello from backend!";
    io.emit("message", `📢 Server broadcast: ${msg}`);
    res.send("Message sent!");
});

httpServer.listen(3000, () => {
    console.log("Socket.IO server running on http://localhost:3000");
    console.log("Simulate message: http://localhost:3000/send?msg=Test");
});
