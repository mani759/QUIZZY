const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("QUIZZY Server is running!");
});

// routerssss....
// const roomRouter = require("./routes/room.routes.js");
// app.use("/api/rooms", roomRouter);

module.exports = app;
