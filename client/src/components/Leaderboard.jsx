import { MotionConfig, motion } from "motion/react";
import { medals } from "./theme";

// Podium steps by position in the list (1st, 2nd, 3rd).
// `order` puts them on screen as 2nd, 1st, 3rd while the HTML (and so a
// screen reader) keeps the real order 1st, 2nd, 3rd.
const steps = [
  { order: "order-2", height: "h-40 sm:h-64", color: "bg-answer-yellow", delay: 0.6 },
  { order: "order-1", height: "h-32 sm:h-48", color: "bg-slate-200", delay: 0.3 },
  { order: "order-3", height: "h-24 sm:h-36", color: "bg-amber-600", delay: 0 },
];

const rowSpring = { type: "spring", stiffness: 500, damping: 40 };

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

const PlayerRow = ({ player, totalQuestions }) => {
  const percent = totalQuestions ? (player.answered / totalQuestions) * 100 : 0;

  return (
    <motion.li
      layout
      transition={rowSpring}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl bg-white px-4 py-3 text-ink shadow-card sm:gap-6 sm:px-6 sm:py-4 ${player.connected ? "" : "opacity-50"}`}
    >
      <span className="grid size-12 place-items-center rounded-full bg-brand font-display text-2xl font-bold text-white sm:size-16 sm:text-3xl">
        {player.rank}
      </span>

      <div className="min-w-0">
        <p className="truncate font-display text-2xl font-semibold sm:text-3xl lg:text-4xl">
          {player.nickname}
          {!player.connected && (
            <span className="ml-3 font-body text-base font-bold sm:text-xl">
              (disconnected)
            </span>
          )}
        </p>

        <div className="mt-2 flex items-center gap-2 sm:gap-4">
          <div className="h-4 flex-1 overflow-hidden rounded-full bg-ink/10" aria-hidden="true">
            <div
              className="h-full rounded-full bg-brand transition-[width] duration-500 motion-reduce:transition-none"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="shrink-0 text-base font-bold tabular-nums sm:text-xl">
            {player.answered} / {totalQuestions}
          </span>
          {player.finished && (
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-correct text-ink sm:size-10">
              <CheckIcon />
              <span className="sr-only">finished</span>
            </span>
          )}
        </div>
      </div>

      <p className="text-right font-display text-3xl font-bold tabular-nums sm:text-4xl lg:text-5xl">
        {player.score}
        <span className="ml-1 font-body text-sm font-bold sm:text-lg">pts</span>
      </p>
    </motion.li>
  );
};

const Podium = ({ players }) => {
  return (
    <ol className="flex items-end justify-center gap-2 sm:gap-4 lg:gap-8">
      {players.map((player, i) => {
        const step = steps[i];
        const medal = medals[player.rank];

        return (
          <motion.li
            key={player.id}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...rowSpring, delay: step.delay }}
            className={`flex min-w-0 max-w-72 flex-1 flex-col items-center gap-2 text-center ${step.order}`}
          >
            {medal && (
              <span role="img" aria-label={medal.label} className="text-5xl sm:text-7xl">
                {medal.emoji}
              </span>
            )}
            <p className="w-full truncate font-display text-xl font-semibold sm:text-3xl lg:text-4xl">
              {player.nickname}
            </p>
            <p className="text-lg font-bold tabular-nums sm:text-2xl">{player.score} pts</p>
            <div
              className={`flex w-full items-start justify-center rounded-t-3xl pt-4 font-display text-4xl font-bold text-ink sm:text-7xl ${step.height} ${step.color}`}
            >
              #{player.rank}
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
};

const Leaderboard = ({ data }) => {
  const { totalQuestions, players } = data;
  const allFinished =
    players.length > 0 && players.every((p) => p.finished || !p.connected);
  const isFinal = data.status === "finished";
  const listed = isFinal ? players.slice(3) : players;

  return (
    // reducedMotion="user": if the OS asks for reduced motion, motion skips
    // movement (layout slides, y) and keeps only the gentle opacity fades.
    <MotionConfig reducedMotion="user">
      <section className="flex flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-4xl font-bold sm:text-5xl lg:text-6xl">
            {isFinal ? "Final results" : "Live leaderboard"}
          </h2>
          {allFinished && (
            <p className="rounded-full bg-correct px-6 py-2 font-display text-2xl font-semibold text-ink">
              🎉 Everyone has finished!
            </p>
          )}
        </div>

        {isFinal && <Podium players={players.slice(0, 3)} />}

        {listed.length > 0 && (
          <ol className="flex flex-col gap-4">
            {listed.map((player) => (
              <PlayerRow
                key={player.id}
                player={player}
                totalQuestions={totalQuestions}
              />
            ))}
          </ol>
        )}
      </section>
    </MotionConfig>
  );
};

export default Leaderboard;
