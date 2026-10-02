const supabase = require("../db/supaBase");

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isValidId = (id) => typeof id === "string" && UUID_PATTERN.test(id);

const toQuiz = (row) => ({
  id: row.id,
  title: row.title,
  creatorId: row.creator_id,
  questions: row.questions.map((q) => ({
    text: q.text,
    options: q.options,
    correctIndex: q.correct_index,
  })),
});

const getQuizById = async (id) => {
  const { data, error } = await supabase
    .from("quizzes")
    .select(
      "id, title, creator_id, questions(id, position, text, options, correct_index)",
    )
    .eq("id", id)
    .order("position", { referencedTable: "questions" })
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? toQuiz(data) : null;
};
const listQuizzes = async (creatorId) => {
  const { data, error } = await supabase
    .from("quizzes")
    .select("id, title, created_at, questions(count)")
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    createdAt: row.created_at,
    questionCount: row.questions[0]?.count ?? 0,
  }));
};

const toPublicQuiz = (quiz) => ({
  id: quiz.id,
  title: quiz.title,
  questions: quiz.questions.map(({ text, options }) => ({ text, options })),
});

const createQuiz = async ({ creatorId, title, questions }) => {
  const { data, error } = await supabase.rpc("create_quiz", {
    p_creator_id: creatorId,
    p_title: title,
    p_questions: questions,
  });

  if (error) {
    throw error;
  }

  return data;
};

module.exports = {
  isValidId,
  getQuizById,
  listQuizzes,
  toPublicQuiz,
  createQuiz,
};
