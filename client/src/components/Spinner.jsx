// A spinning ring. Pass size and border colors via className, e.g.
// "size-16 border-8 border-white/25 border-t-white".
// Under reduced motion it stays still, so always pair it with text.
const Spinner = ({ className }) => {
  return (
    <span
      className={`inline-block shrink-0 animate-spin rounded-full motion-reduce:animate-none ${className}`}
      aria-hidden="true"
    />
  );
};

export default Spinner;
