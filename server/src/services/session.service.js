const supabase = require("../db/supaBase");

const saveSessionResults = async ({
  quizId,
  roomCode,
  startedAt,
  leaderboard,
}) => {
  const results = leaderboard.map((entry) => ({
    nickname: entry.nickname,
    score: entry.score,
    rank: entry.rank,
    answered: entry.answered,
    finished: entry.finished,
  }));

  const { data, error } = await supabase.rpc("save_session_results", {
    p_quiz_id: quizId,
    p_room_code: roomCode,
    p_started_at: new Date(startedAt).toISOString(),
    p_results: results,
  });

  if (error) {
    throw error;
  }

  return data;
};

module.exports = { saveSessionResults };
