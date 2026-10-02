const supabase = require("../db/supaBase");

const socketAuth = async (socket, next) => {
  socket.data.userId = null;

  const token = socket.handshake.auth?.token;

  if (!token) {
    return next();
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (!error && data.user) {
      socket.data.userId = data.user.id;
    }
  } catch (err) {
    console.error("socket auth failed:", err.message, err.cause);
  }
  console.log(
    "socket auth:",
    socket.id,
    token ? "has token" : "no token",
    "→ userId:",
    socket.data.userId,
  );

  next();
};

module.exports = socketAuth;
