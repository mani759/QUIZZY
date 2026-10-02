// Full-screen page with its content centered both ways. Add gap / text-center
// etc. via className.
const CenteredPage = ({ className = "", ...props }) => {
  return (
    <main
      {...props}
      className={`flex min-h-dvh flex-col items-center justify-center px-4 py-8 ${className}`}
    />
  );
};

export default CenteredPage;
