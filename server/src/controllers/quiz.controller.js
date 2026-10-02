const quizService = require("../services/quiz.service");
const { quizSchema } = require("../validation/quiz.schema");
const aiService = require("../services/ai.service");
const { generateRequestSchema } = require("../validation/ai.schema");

const getQuiz = async (req, res) => {
  const { id } = req.params;

  if (!quizService.isValidId(id)) {
    return res.status(400).json({ error: "Invalid quiz id" });
  }

  try {
    const quiz = await quizService.getQuizById(id);

    if (!quiz || quiz.creatorId !== req.user.id) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    res.json(quiz);
  } catch (err) {
    console.error("getQuiz failed:", err.message);
    res.status(500).json({ error: "Could not load quiz" });
  }
};
const listQuizzes = async (req, res) => {
  try {
    const quizzes = await quizService.listQuizzes(req.user.id);
    res.json(quizzes);
  } catch (err) {
    console.error("listQuizzes failed:", err.message);
    res.status(500).json({ error: "Could not load quizzes" });
  }
};
const createQuiz = async (req, res) => {
  const result = quizSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: result.error.issues[0].message });
  }

  try {
    const id = await quizService.createQuiz({
      creatorId: req.user.id,
      ...result.data,
    });
    res.status(201).json({ id });
  } catch (err) {
    console.error("createQuiz failed:", err.message);
    res.status(500).json({ error: "Could not save quiz" });
  }
};
const generateQuiz = async (req, res) => {
  const parsed = generateRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  try {
    const questions = await aiService.generateQuestions(parsed.data);
    res.json({ questions });
  } catch (err) {
    console.error("generateQuiz failed:", err.message, err.cause);
    res
      .status(502)
      .json({ error: "Could not generate questions. Please try again." });
  }
};
module.exports = { getQuiz, listQuizzes, createQuiz, generateQuiz };
