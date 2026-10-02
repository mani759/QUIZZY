const questionService = require("./question.service");
const MAX_NICKNAME_LENGTH = 20;

const POINTS_PER_CORRECT = 10;

const rooms = new Map();

const generateRoomCode = () => {
  let code;

  do {
    code = Math.floor(100000 + Math.random() * 900000).toString();
  } while (rooms.has(code));

  return code;
};

const roomService = (hostId, quiz) => {
  const code = generateRoomCode();

  const room = {
    code,
    hostId,
    quiz,
    players: [],
    status: "waiting",
    startedAt: null,
    closeTimer: null,
  };

  rooms.set(code, room);

  return room;
};

const getRoom = (code) => {
  return rooms.get(code);
};

const addPlayer = (code, { id, nickname }) => {
  const room = rooms.get(code);

  if (!room) {
    return { error: "Room not found" };
  }

  if (room.status !== "waiting") {
    return { error: "This quiz has already started" };
  }

  if (typeof nickname !== "string") {
    return { error: "Invalid nickname" };
  }

  const cleanName = nickname.trim();

  if (cleanName.length === 0 || cleanName.length > MAX_NICKNAME_LENGTH) {
    return { error: `Nickname must be 1 to ${MAX_NICKNAME_LENGTH} characters` };
  }

  if (room.players.some((p) => p.id === id)) {
    return { error: "You have already joined this room" };
  }

  const nameTaken = room.players.some(
    (p) => p.nickname.toLowerCase() === cleanName.toLowerCase(),
  );

  if (nameTaken) {
    return { error: "That nickname is already taken" };
  }

  const player = {
    id,
    nickname: cleanName,
    score: 0,
    currentQuestionIndex: 0,
    finished: false,
    connected: true,
  };

  room.players.push(player);

  return { room };
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
  room.startedAt = Date.now();

  return { room };
};

const submitAnswer = (code, playerId, questionIndex, optionIndex) => {
  const room = rooms.get(code);

  if (!room) {
    return { error: "Room not found" };
  }
  const { questions } = room.quiz;
  if (room.status !== "playing") {
    return { error: "Quiz is not running" };
  }

  const player = room.players.find((p) => p.id === playerId);
  if (!player) {
    return { error: "Only players can answer" };
  }

  if (player.finished) {
    return { error: "You have already finished the quiz" };
  }

  if (questionIndex !== player.currentQuestionIndex) {
    return { error: "This question has already been answered" };
  }

  const optionCount = questionService.getOptionCount(
    questions,
    player.currentQuestionIndex,
  );
  const isValidOption =
    Number.isInteger(optionIndex) &&
    optionIndex >= 0 &&
    optionIndex < optionCount;

  if (!isValidOption) {
    return { error: "Invalid option" };
  }

  const answeredIndex = player.currentQuestionIndex;
  const correct = questionService.isCorrect(
    questions,
    answeredIndex,
    optionIndex,
  );

  if (correct) {
    player.score += POINTS_PER_CORRECT;
  }

  player.currentQuestionIndex += 1;

  if (player.currentQuestionIndex >= questions.length) {
    player.finished = true;
  }

  return {
    room,
    player,
    correct,
    correctOption: questionService.getCorrectAnswer(questions, answeredIndex),
  };
};
const getLeaderboard = (room) => {
  const sorted = room.players
    .map((player) => ({
      id: player.id,
      nickname: player.nickname,
      score: player.score,
      answered: player.currentQuestionIndex,
      finished: player.finished,
      connected: player.connected,
    }))
    .sort((a, b) => b.score - a.score || a.nickname.localeCompare(b.nickname));

  return sorted.map((player) => ({
    ...player,
    rank: sorted.findIndex((p) => p.score === player.score) + 1,
  }));
};
const removePlayer = (code, playerId) => {
  const room = rooms.get(code);

  if (!room) {
    return { error: "Room not found" };
  }

  const player = room.players.find((p) => p.id === playerId);

  if (!player) {
    return { error: "Player not found" };
  }

  if (room.status === "waiting") {
    room.players = room.players.filter((p) => p.id !== playerId);
  } else {
    player.connected = false;
  }

  return { room };
};

const closeRoom = (code) => {
  rooms.delete(code);
};
const endQuiz = (code, requesterId) => {
  const room = rooms.get(code);

  if (!room) {
    return { error: "Room not found" };
  }

  if (room.hostId !== requesterId) {
    return { error: "Only the host can end the quiz" };
  }

  if (room.status !== "playing") {
    return { error: "Quiz is not running" };
  }

  room.status = "finished";

  return { room };
};
const findRoomByHost = (hostId) => {
  for (const room of rooms.values()) {
    if (room.hostId === hostId) {
      return room;
    }
  }
  return null;
};
module.exports = {
  roomService,
  getRoom,
  addPlayer,
  startQuiz,
  submitAnswer,
  getLeaderboard,
  removePlayer,
  closeRoom,
  endQuiz,
  findRoomByHost,
};
