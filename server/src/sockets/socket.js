const roomService = require("../services/room.service");
const quizService = require("../services/quiz.service");
const questionService = require("../services/question.service");
const sessionService = require("../services/session.service");
const socketAuth = require("./socketAuth");
const HOST_GRACE_MS = 60 * 1000;

const registerSocketHandler = (io) => {
  io.use(socketAuth);
  const emitLeaderboard = (room) => {
    io.to(`host:${room.code}`).emit("leaderboard:update", {
      status: room.status,
      totalQuestions: room.quiz.questions.length,
      players: roomService.getLeaderboard(room),
    });
  };
  io.on("connection", (socket) => {
    console.log(`Socket connected :${socket.id}`);

    socket.on("host:create-room", async (data = {}) => {
      const { quizId } = data;
      const userId = socket.data.userId;

      if (!userId) {
        socket.emit("host:error", { message: "Please log in to host a quiz" });
        return;
      }

      if (socket.data.roomCode || socket.data.creatingRoom) {
        socket.emit("host:error", { message: "You already have a room" });
        return;
      }

      if (roomService.findRoomByHost(userId)) {
        socket.emit("host:error", {
          message: "You already have a running room",
        });
        return;
      }

      if (!quizService.isValidId(quizId)) {
        socket.emit("host:error", { message: "Invalid quiz id" });
        return;
      }

      socket.data.creatingRoom = true;

      try {
        const quiz = await quizService.getQuizById(quizId);

        if (!socket.connected) {
          return;
        }

        if (!quiz || quiz.creatorId !== userId) {
          socket.emit("host:error", { message: "Quiz not found" });
          return;
        }

        if (quiz.questions.length === 0) {
          socket.emit("host:error", {
            message: "This quiz has no questions yet",
          });
          return;
        }

        if (roomService.findRoomByHost(userId)) {
          socket.emit("host:error", {
            message: "You already have a running room",
          });
          return;
        }

        const room = roomService.roomService(userId, quiz);

        socket.data.roomCode = room.code;
        socket.data.role = "host";

        socket.join(room.code);
        socket.join(`host:${room.code}`);

        socket.emit("room:created", { code: room.code, quizTitle: quiz.title });

        console.log(`Room ${room.code} created for "${quiz.title}"`);
      } catch (err) {
        console.error("create-room failed:", err.message, err.cause);
        socket.emit("host:error", { message: "Could not load quiz" });
      } finally {
        socket.data.creatingRoom = false;
      }
    });

    socket.on("player:join", (data = {}) => {
      const { roomCode, nickname } = data;

      const result = roomService.addPlayer(roomCode, {
        id: socket.id,
        nickname,
      });

      if (result.error) {
        socket.emit("player:join:error", { message: result.error });
        return;
      }

      const { room } = result;

      socket.data.roomCode = room.code;
      socket.data.role = "player";

      socket.join(room.code);
      io.to(room.code).emit("room:players", room.players);

      console.log(`${room.players.at(-1).nickname} joined room ${room.code}`);
    });
    socket.on("quiz:start", ({ roomCode }) => {
      const { room, error } = roomService.startQuiz(
        roomCode,
        socket.data.userId,
      );
      if (error) {
        socket.emit("quiz:error", { message: error });
        return;
      }

      room.players.forEach((player) => {
        io.to(player.id).emit(
          "quiz:question",
          questionService.getPublicQuestion(
            room.quiz.questions,
            player.currentQuestionIndex,
          ),
        );
      });

      emitLeaderboard(room);

      console.log(`Quiz started in room ${room.code}`);
    });
    socket.on("quiz:answer", (data = {}) => {
      const { roomCode, questionIndex, optionIndex } = data;

      const result = roomService.submitAnswer(
        roomCode,
        socket.id,
        questionIndex,
        optionIndex,
      );

      if (result.error) {
        socket.emit("quiz:answer:error", { message: result.error });
        return;
      }

      const { room, player, correct, correctOption } = result;

      socket.emit("quiz:answer:result", {
        correct,
        correctOption,
        score: player.score,
        nextQuestion: player.finished
          ? null
          : questionService.getPublicQuestion(
              room.quiz.questions,
              player.currentQuestionIndex,
            ),
      });
      emitLeaderboard(room);

      console.log(
        `Room ${room.code}: ${player.nickname} ${correct ? "correct" : "wrong"}, score ${player.score}${player.finished ? " (finished)" : ""}`,
      );
    });
    socket.on("disconnect", () => {
      console.log("DISCONNECT:", socket.id, socket.data);
      const { roomCode, role } = socket.data;

      if (!roomCode) {
        return;
      }

      if (role === "host") {
        const room = roomService.getRoom(roomCode);

        if (!room) {
          return;
        }

        const hostSocketsLeft =
          io.sockets.adapter.rooms.get(`host:${roomCode}`)?.size ?? 0;

        if (hostSocketsLeft > 0) {
          return;
        }

        room.closeTimer = setTimeout(() => {
          if (roomService.getRoom(room.code) !== room) {
            return;
          }

          if (room.status !== "finished") {
            io.to(room.code).emit("room:closed", {
              message: "The host has ended the session",
            });
          }

          roomService.closeRoom(room.code);
          console.log(`Room ${room.code} closed (host did not return)`);
        }, HOST_GRACE_MS);

        console.log(
          `Host left room ${room.code}; closing in ${HOST_GRACE_MS / 1000}s unless they return`,
        );
        return;
      }

      const result = roomService.removePlayer(roomCode, socket.id);

      if (result.error) {
        return;
      }

      const { room } = result;

      if (room.status === "waiting") {
        io.to(room.code).emit("room:players", room.players);
      } else {
        emitLeaderboard(room);
      }
    });
    socket.on("quiz:end", async (data = {}) => {
      const { roomCode } = data;

      const result = roomService.endQuiz(roomCode, socket.data.userId);

      if (result.error) {
        socket.emit("quiz:error", { message: result.error });
        return;
      }

      const { room } = result;
      const leaderboard = roomService.getLeaderboard(room);

      leaderboard.forEach((entry) => {
        io.to(entry.id).emit("quiz:ended", {
          rank: entry.rank,
          score: entry.score,
          totalPlayers: leaderboard.length,
        });
      });

      emitLeaderboard(room);
      try {
        await sessionService.saveSessionResults({
          quizId: room.quiz.id,
          roomCode: room.code,
          startedAt: room.startedAt,
          leaderboard,
        });

        console.log(`Results saved for room ${room.code}`);
      } catch (err) {
        console.error("save results failed:", err.message, err.cause);
        socket.emit("host:error", {
          message: "The quiz ended, but the results could not be saved",
        });
      }

      console.log(`Quiz ended in room ${room.code}`);
    });
    socket.on("host:resume", () => {
      const userId = socket.data.userId;

      if (!userId) {
        socket.emit("host:error", { message: "Please log in to host a quiz" });
        return;
      }

      const room = roomService.findRoomByHost(userId);

      if (!room) {
        socket.emit("host:no-room");
        return;
      }

      if (room.closeTimer) {
        clearTimeout(room.closeTimer);
        room.closeTimer = null;
      }

      socket.data.roomCode = room.code;
      socket.data.role = "host";

      socket.join(room.code);
      socket.join(`host:${room.code}`);

      socket.emit("room:resumed", {
        code: room.code,
        quizTitle: room.quiz.title,
        players: room.players,
      });

      if (room.status !== "waiting") {
        emitLeaderboard(room);
      }

      console.log(`Host resumed room ${room.code}`);
    });

    socket.on("host:close-room", (ack = () => {}) => {
      const { roomCode, role, userId } = socket.data;

      if (role !== "host" || !roomCode) {
        ack();
        return;
      }

      const room = roomService.getRoom(roomCode);

      if (room && room.hostId === userId) {
        if (room.closeTimer) {
          clearTimeout(room.closeTimer);
          room.closeTimer = null;
        }

        if (room.status !== "finished") {
          io.to(room.code).emit("room:closed", {
            message: "The host has ended the session",
          });
        }

        roomService.closeRoom(room.code);
        console.log(`Room ${room.code} closed by host`);
      }

      socket.leave(roomCode);
      socket.leave(`host:${roomCode}`);
      socket.data.roomCode = null;
      socket.data.role = null;

      ack();
    });
  });
};

module.exports = registerSocketHandler;
