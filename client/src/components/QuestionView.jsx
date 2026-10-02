import AnswerShape from "./AnswerShape";
import { answerStyles } from "./theme";

const tileBase =
  "relative flex min-h-32 min-w-0 flex-col items-center justify-center gap-2 rounded-2xl p-4 " +
  "text-center font-display text-xl leading-tight font-semibold wrap-anywhere " +
  "transition-[transform,box-shadow,opacity] duration-150 motion-reduce:transition-none " +
  "focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-white " +
  "enabled:active:translate-y-1 enabled:active:shadow-[0_2px_0_rgb(0_0_0/0.3)] " +
  "disabled:cursor-not-allowed";

// Exactly one of these per tile: two shadow classes on one element would clash.
const raised = "shadow-[0_6px_0_rgb(0_0_0/0.3)]";
const pressed = "translate-y-1 shadow-[0_2px_0_rgb(0_0_0/0.3)]";

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

const CrossIcon = () => (
  <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" aria-hidden="true">
    <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
  </svg>
);

const QuestionView = ({
  data,
  selectedOption = null,
  correctOption = null,
  disabled,
  onAnswer,
}) => {
  const { index, total, question } = data;
  const revealed = correctOption !== null;
  const answered = selectedOption !== null;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <p className="mb-2 text-sm font-bold tracking-wide uppercase">
          Question {index + 1} of {total}
        </p>
        <div className="h-3 overflow-hidden rounded-full bg-white/20" aria-hidden="true">
          <div
            className="h-full rounded-full bg-white transition-[width] duration-500 motion-reduce:transition-none"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <h2 className="rounded-3xl bg-white p-5 text-center text-2xl font-semibold text-ink shadow-card wrap-anywhere sm:text-3xl">
        {question.text}
      </h2>

      <div className="grid flex-1 auto-rows-fr grid-cols-2 gap-3 sm:gap-4">
        {question.options.map((option, i) => {
          const isSelected = i === selectedOption;
          const isCorrect = i === correctOption;
          const isWrongPick =
            isSelected && correctOption !== null && !isCorrect;
          const tile = answerStyles[i % answerStyles.length];

          let state = raised;
          if (revealed) {
            if (isCorrect) state = `ring-[6px] ring-correct ${raised}`;
            else if (isWrongPick) state = `ring-[6px] ring-wrong ${pressed}`;
            else state = `opacity-40 ${raised}`;
          } else if (answered) {
            state = isSelected
              ? `ring-[6px] ring-white ${pressed}`
              : `opacity-40 ${raised}`;
          }

          return (
            <button
              key={i}
              onClick={() => onAnswer?.(i)}
              disabled={disabled}
              className={`${tileBase} ${tile.color} ${state}`}
            >
              <AnswerShape shape={tile.shape} className="size-8 shrink-0 sm:size-10" />
              <span>{option}</span>

              {isCorrect && (
                <span className="absolute -top-3 -right-3 grid size-10 place-items-center rounded-full border-4 border-white bg-correct text-ink">
                  <CheckIcon />
                  <span className="sr-only">(correct answer)</span>
                </span>
              )}
              {isWrongPick && (
                <span className="absolute -top-3 -right-3 grid size-10 place-items-center rounded-full border-4 border-white bg-wrong text-white">
                  <CrossIcon />
                  <span className="sr-only">(your answer, wrong)</span>
                </span>
              )}
              {isSelected && !revealed && (
                <span className="sr-only">(your answer)</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionView;
