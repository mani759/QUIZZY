// Text input / select styling for white cards. No font size here: pass one
// in className (text-lg, text-2xl...), since two text sizes would clash.
const base =
  "w-full rounded-2xl border-4 border-ink/15 bg-white px-4 py-3 text-ink placeholder:text-ink/40 " +
  "focus:border-brand focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/30";

const Input = ({ as: Component = "input", className = "", ...props }) => {
  return <Component {...props} className={`${base} ${className}`} />;
};

export default Input;
