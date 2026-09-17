import { io } from "socket.io-client";

// Pripojenie na server
const socket = io("http://localhost:3000");

export default socket;