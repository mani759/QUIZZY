const rooms = new Map();

const generateRoomCode = () => {
  let code;

  do {
    code = Math.floor(100000 + Math.random() * 900000).toString();
  } while (rooms.has(code));

  return code;
};

const roomService = () => {
  const code = generateRoomCode();

  const room = {
    code,
    players: [],
    status: "waiting",
  };

  rooms.set(code, room);

  return room;
};

module.exports = {
  roomService,
};
