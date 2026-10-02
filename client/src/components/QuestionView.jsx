const QuestionView = ({
  data,
  selectedOption = null,
  correctOption = null,
  disabled,
  onAnswer,
}) => {
  const { index, total, question } = data;

  return (
    <div>
      <p>
        Question {index + 1} of {total}
      </p>
      <h2>{question.text}</h2>

      <div>
        {question.options.map((option, i) => {
          const isSelected = i === selectedOption;
          const isCorrect = i === correctOption;
          const isWrongPick =
            isSelected && correctOption !== null && !isCorrect;

          return (
            <button
              key={i}
              onClick={() => onAnswer?.(i)}
              disabled={disabled}
              style={{
                fontWeight: isSelected ? "bold" : "normal",
                color: isCorrect ? "green" : isWrongPick ? "red" : "inherit",
              }}
            >
              {option}
              {isCorrect && " ✓"}
              {isWrongPick && " ✗"}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionView;
