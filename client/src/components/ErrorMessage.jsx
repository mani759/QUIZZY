// Red error box, readable on both white cards and the purple background.
// The ⚠️ icon means the error doesn't rely on color alone.
const ErrorMessage = ({ children, className = "", ...props }) => {
  return (
    <p
      role="alert"
      {...props}
      className={`rounded-xl bg-red-50 px-3 py-2 font-bold text-red-700 ring-2 ring-wrong/40 ${className}`}
    >
      <span aria-hidden="true">⚠️ </span>
      {children}
    </p>
  );
};

export default ErrorMessage;
