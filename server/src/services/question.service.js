const getPublicQuestion = (questions, index) => {
  const { text, options } = questions[index];

  return {
    index,
    total: questions.length,
    question: { text, options },
  };
};

const getOptionCount = (questions, index) => questions[index].options.length;

const getCorrectAnswer = (questions, index) => questions[index].correctIndex;

const isCorrect = (questions, index, optionIndex) =>
  questions[index].correctIndex === optionIndex;

module.exports = {
  getPublicQuestion,
  getOptionCount,
  getCorrectAnswer,
  isCorrect,
};
