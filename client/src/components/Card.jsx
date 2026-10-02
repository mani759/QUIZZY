// White card with the chunky bottom shadow. Padding and layout come from
// className, since they differ per screen. `as` changes the element (form, li...).
const Card = ({ as: Component = "div", className = "", ...props }) => {
  return (
    <Component
      {...props}
      className={`rounded-3xl bg-white text-ink shadow-card ${className}`}
    />
  );
};

export default Card;
