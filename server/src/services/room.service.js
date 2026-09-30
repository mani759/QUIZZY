const rooms = new Map();

const generateRoomCode = () => {
  let code;

  do {
    code = Math.floor(100000 + Math.random() * 900000).toString();
  } while (rooms.has(code));

  return code;
};

const roomService = (hostId) => {
  const code = generateRoomCode();

  const room = {
    code,
    hostId,
    players: [],
    status: "waiting",
    currentQuestionIndex: 0,
  };

  rooms.set(code, room);

  return room;
};

const getRoom = (code) => {
  return rooms.get(code);
};

const addPlayer = (code, player) => {
  const room = rooms.get(code);

  if (!room) {
    return null;
  }

  room.players.push(player);

  return room;
};
const startQuiz = (code, requesterId) => {
  const room = rooms.get(code);

  if (!room) {
    return { error: "Room not found" };
  }

  if (room.hostId !== requesterId) {
    return { error: "Only the host can start the quiz" };
  }

  if (room.status !== "waiting") {
    return { error: "Quiz has already started" };
  }

  if (room.players.length === 0) {
    return { error: "At least one player is needed to start" };
  }

  room.status = "playing";
  room.currentQuestionIndex = 0;

  return { room };
};
module.exports = {
  roomService,
  getRoom,
  addPlayer,
  startQuiz,
};
