const { z } = require("zod");

const generateRequestSchema = z.object({
  topic: z
    .string()
    .trim()
    .min(3, "Topic is too short")
    .max(100, "Topic is too long"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  count: z
    .number()
    .int()
    .min(1, "Ask for at least 1 question")
    .max(15, "At most 15 questions at a time"),
});

module.exports = { generateRequestSchema };
