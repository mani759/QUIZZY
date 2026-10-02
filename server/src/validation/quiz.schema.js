const { z } = require("zod");

const questionSchema = z
  .object({
    text: z
      .string()
      .trim()
      .min(1, "Every question needs text")
      .max(300, "Question text is too long"),
    options: z
      .array(
        z
          .string()
          .trim()
          .min(1, "Options cannot be empty")
          .max(100, "An option is too long"),
      )
      .min(2, "Each question needs at least 2 options")
      .max(6, "A question can have at most 6 options"),
    correctIndex: z.number().int(),
  })
  .refine((q) => q.correctIndex >= 0 && q.correctIndex < q.options.length, {
    message: "Every question needs a correct answer from its options",
    path: ["correctIndex"],
  });

const quizSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(100, "Title is too long"),
  questions: z
    .array(questionSchema)
    .min(1, "Add at least one question")
    .max(50, "A quiz can have at most 50 questions"),
});

module.exports = { quizSchema, questionSchema };
