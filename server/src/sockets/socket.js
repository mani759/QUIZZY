const roomService = require("../services/room.service");
const questions = require("../data/questions");

const registerSocketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log(`Socket connected :${socket.id}`);

    socket.on("host:create-room", () => {
      const room = roomService.roomService(socket.id);

      socket.join(room.code);

      socket.emit("room:created", { code: room.code });

      console.log(`Room ${room.code} created by host ${socket.id}`);
    });

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
    socket.on("quiz:start", ({ roomCode }) => {
      const { room, error } = roomService.startQuiz(roomCode, socket.id);
      if (error) {
        socket.emit("quiz:error", { message: error });
        return;
      }

      const question = questions[room.currentQuestionIndex];
      const { correctAnswer, ...publicQuestion } = question;
      io.to(room.code).emit("quiz:question", {
        index: room.currentQuestionIndex,
        total: questions.length,
        question: publicQuestion,
      });
    });
  });
};

module.exports = registerSocketHandler;
