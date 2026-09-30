const QuestionView = ({ data }) => {
  const { index, total, question } = data;

  return (
    <div>
      <p>
        Question {index + 1} of {total}
      </p>
      <h2>{question.question}</h2>

      <div>
        {question.options.map((option, i) => (
          <button key={i} onClick={() => console.log("Chose option", i)}>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestionView;
