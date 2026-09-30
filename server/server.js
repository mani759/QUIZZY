const app = require("./src/app.js");
const http = require("http");
const { Server } = require("socket.io");
const registerSocketHandler = require("./src/sockets/socket.js");
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "http://localhost:5173" },
});

registerSocketHandler(io);

httpServer.listen(3000, (req, res) => {
  console.log("Server is running on port http://localhost:3000");
});
