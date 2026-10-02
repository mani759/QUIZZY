// Shared visual constants. One source of truth so the answer colors and
// shapes on the create page always match what students see.

// One entry per answer slot, in order. Yellow uses dark text for contrast.
export const answerStyles = [
  { shape: "triangle", color: "bg-answer-red text-white" },
  { shape: "diamond", color: "bg-answer-blue text-white" },
  { shape: "circle", color: "bg-answer-yellow text-ink" },
  { shape: "square", color: "bg-answer-green text-white" },
];

export const medals = {
  1: { emoji: "🥇", label: "Gold medal" },
  2: { emoji: "🥈", label: "Silver medal" },
  3: { emoji: "🥉", label: "Bronze medal" },
};
