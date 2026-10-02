require("dotenv").config();
const app = require("./src/app.js");
const http = require("http");
const { Server } = require("socket.io");
const registerSocketHandler = require("./src/sockets/socket.js");

const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: { origin: CLIENT_URL },
});

registerSocketHandler(io);

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
