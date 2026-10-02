const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { questionSchema } = require("../validation/quiz.schema");

const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL;

if (!apiKey || !model) {
  throw new Error("Missing GEMINI_API_KEY or GEMINI_MODEL in .env");
}

const ai = new GoogleGenAI({ apiKey });

const MAX_ATTEMPTS = 2;
const TRANSIENT_STATUSES = [429, 500, 503];
const MAX_RETRIES = 2;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const callWithRetry = async (fn) => {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isTransient = TRANSIENT_STATUSES.includes(err.status);

      if (!isTransient || attempt >= MAX_RETRIES) {
        throw err;
      }

      const delay = 1000 * 2 ** attempt;
      console.warn(`AI call failed with ${err.status}, retrying in ${delay}ms`);
      await sleep(delay);
    }
  }
};

const responseJsonSchema = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          text: { type: "string" },
          options: { type: "array", items: { type: "string" } },
          correctIndex: { type: "integer" },
        },
        required: ["text", "options", "correctIndex"],
      },
    },
  },
  required: ["questions"],
};

const generatedSchema = z.object({
  questions: z.array(questionSchema).min(1),
});

const buildPrompt = ({ topic, difficulty, count }) => `
Create ${count} multiple-choice quiz questions about this topic: "${topic}".
Difficulty: ${difficulty}.

Rules:
- Each question has exactly 4 options.
- Exactly one option is correct. "correctIndex" is the position of the correct option, from 0 to 3.
- Vary the position of the correct answer across questions.
- Wrong options should be plausible, not obviously silly.
- Do not use "all of the above" or "none of the above".
- Keep each question under 200 characters and each option under 80 characters.
`;

const generateQuestions = async (input) => {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const response = await callWithRetry(() =>
      ai.models.generateContent({
        model,
        contents: buildPrompt(input),
        config: {
          responseMimeType: "application/json",
          responseJsonSchema,
        },
      }),
    );

    let parsed = null;

    try {
      parsed = JSON.parse(response.text);
    } catch {
      parsed = null;
    }

    const result = generatedSchema.safeParse(parsed);

    if (result.success) {
      return result.data.questions.slice(0, input.count);
    }

    console.warn(
      `AI output failed validation (attempt ${attempt}):`,
      result.error.issues[0]?.message,
    );
  }

  throw new Error("AI returned invalid questions");
};

module.exports = { generateQuestions };
