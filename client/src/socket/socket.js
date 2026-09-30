import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  autoConnect: false,
});
window.socket = socket;

export default socket;
