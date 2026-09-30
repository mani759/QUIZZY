const roomService = require("../services/room.service");

const registerSocketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log(`Socket connected :${socket.id}`);

    socket.on("player:join", (data) => {
      const { roomCode, nickname } = data;

      const room = roomService.getRoom(roomCode);

      if (!room) {
        socket.emit("player:join:error", {
          message: "Room not found",
        });
        return;
      }

      const player = { id: socket.id, nickname };

      roomService.addPlayer(roomCode, player);
      socket.join(roomCode);
      io.to(roomCode).emit("room:players", room.players);
    });
  });
};

module.exports = registerSocketHandler;
