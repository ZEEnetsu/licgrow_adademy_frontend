const Btn = ({
  title,
  icon,
  type,
  variant = 'primary',
  className = "",
  size = "sm",
  ...props
}) => {
  const variants = {
    primary: "bg-green-400 text-zinc-950 hover:bg-green-500",
    secondary: "bg-zinc-800 text-zinc-200 hover:text-zinc-950 hover:bg-green-400",
    outline:
      "border-2 border-zinc-200 bg-transparent hover:bg-zinc-50 text-zinc-900",
    ghost: "bg-transparent text-zinc-500 hover:bg-zinc-100/20 ",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };
  const sizes = {
    sm: "h-8 px-2 text-sm",
    md: "h-10 px-4 text-base",
    lg: "h-12 px-6 text-lg",
  };

  return (
    <button type={type} className={`rounded-md flex w-full text-center items-center gap-2 transition-colors duration-200 ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      <img src={icon} alt={icon} className="h-6" />
      <p className="mx-auto">{title}</p>
    </button>
  );
};

export default Btn;
