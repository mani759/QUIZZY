const express = require("express");
const quizController = require("../controllers/quiz.controller");
const requireAuth = require("../middlewares/requireAuth");
const aiRateLimit = require("../middlewares/aiRateLimit");

const router = express.Router();
router.use(requireAuth);
console.log("controller exports:", Object.keys(quizController));
router.get("/", quizController.listQuizzes);
router.post("/", quizController.createQuiz);
router.get("/:id", quizController.getQuiz);

router.post("/generate", quizController.generateQuiz);
router.post("/generate", aiRateLimit, quizController.generateQuiz);

module.exports = router;
