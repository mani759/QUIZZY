// Three gently bouncing dots. Under reduced motion they simply sit still,
// so the accompanying text must always say what we're waiting for.
const WaitingDots = () => {
  return (
    <span className="inline-flex gap-2" aria-hidden="true">
      {["[animation-delay:0ms]", "[animation-delay:200ms]", "[animation-delay:400ms]"].map(
        (delay) => (
          <span
            key={delay}
            className={`size-3 rounded-full bg-white animate-wait motion-reduce:animate-none ${delay}`}
          />
        ),
      )}
    </span>
  );
};

export default WaitingDots;
