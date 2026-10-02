// Shape for each answer slot, so options are recognizable without color.
// fill="currentColor" makes the shape take the surrounding text color.
const paths = {
  triangle: <polygon points="12,3 22,20 2,20" />,
  diamond: <polygon points="12,1.5 22.5,12 12,22.5 1.5,12" />,
  circle: <circle cx="12" cy="12" r="10" />,
  square: <rect x="3" y="3" width="18" height="18" rx="2" />,
};

const AnswerShape = ({ shape, className = "size-8" }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {paths[shape]}
    </svg>
  );
};

export default AnswerShape;
