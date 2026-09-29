const express = require("express");
const roomController = require("../controllers/room.controller.js");
const router = express.Router();

router.post("/create-room", roomController.createRoom);

module.exports = router;
