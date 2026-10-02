const base =
  "inline-flex items-center justify-center gap-2 rounded-2xl font-display font-semibold " +
  "transition-[transform,box-shadow] duration-100 motion-reduce:transition-none " +
  "focus-visible:outline-4 focus-visible:outline-offset-2 " +
  "not-disabled:active:translate-y-1 " +
  "disabled:cursor-not-allowed disabled:opacity-50";

// Sizes live here (not in className) because two classes setting the same
// property, like text-lg and text-2xl, can't reliably override each other.
const sizes = {
  md: "px-6 py-3 text-lg",
  lg: "px-8 py-4 text-2xl",
  xl: "px-10 py-5 text-3xl lg:text-4xl",
};

const variants = {
  white:
    "focus-visible:outline-white bg-white text-brand shadow-[0_6px_0_#c4b5fd] not-disabled:active:shadow-[0_2px_0_#c4b5fd]",
  // brand sits on white cards, so its focus ring is dark.
  brand:
    "focus-visible:outline-ink bg-brand text-white shadow-[0_6px_0_var(--color-brand-dark)] not-disabled:active:shadow-[0_2px_0_var(--color-brand-dark)]",
  ghost:
    "focus-visible:outline-white bg-white/10 text-white ring-2 ring-white/40 shadow-[0_6px_0_rgb(0_0_0/0.25)] not-disabled:active:shadow-[0_2px_0_rgb(0_0_0/0.25)]",
  // For use on white cards, where ghost's white text would disappear.
  outline:
    "focus-visible:outline-brand bg-white text-ink ring-2 ring-ink/20 shadow-[0_6px_0_rgb(30_27_75/0.2)] not-disabled:active:shadow-[0_2px_0_rgb(30_27_75/0.2)]",
};

// `as` lets a router <Link> look like a button: <Button as={Link} to="/x">.
// not-disabled: (rather than enabled:) is used above because links never
// match :enabled, so the press effect would otherwise never run on them.
const Button = ({
  as: Component = "button",
  variant = "white",
  size = "md",
  className = "",
  ...props
}) => {
  return (
    <Component
      type={Component === "button" ? "button" : undefined}
      {...props}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    />
  );
};

export default Button;
