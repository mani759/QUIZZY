const express = require("express");
const cors = require("cors");

const app = express();

// app.use(cors());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());
app.get("/", (req, res) => {
  res.send("QUIZZY Server is running!");
});

// routerssss....
// const roomRouter = require("./routes/room.routes.js");
// app.use("/api/rooms", roomRouter);
const quizRouter = require("./routes/quiz.routes");
app.use("/api/quizzes", quizRouter);

module.exports = app;
