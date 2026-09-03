const Btn = ({
  title,
  icon = null,
  type,
  variant = 'primary',
  className = "",
  size = "sm",
  ...props
}) => {
  const variants = {
    primary: "bg-accent text-accent-contrast hover:bg-accent/90",
    secondary: "bg-accent-muted text-text-primary hover:text-text-primary hover:bg-accent/20 text-sm cursor-pointer ",
    outline:
      "border-1 border-border bg-transparent hover:bg-surface hover:text-text-primary text-text-muted",
    ghost: "bg-transparent text-text-muted hover:bg-surface-hover ",
    danger: "bg-danger text-white hover:bg-danger/80 hover:text-white",
  };
  const sizes = {
    sm: "h-8 px-4 text-sm",
    md: "h-10 px-6 text-base",
    lg: "h-12 px-8 text-lg",
  };

  return (
    <button type={type} className={` cursor-pointer rounded-2xl flex w-fit text-center items-center gap-2 transition-colors duration-200 ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {
         icon === null ? "" : <img src={icon} alt={icon} className="h-6" />
      }
      <p className="mx-auto">{title}</p>
    </button>
  );
};

export default Btn;
