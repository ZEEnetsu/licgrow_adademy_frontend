import { cn } from './cn.js';

const VARIANTS = {
  primary:
    'border border-lic-teal/20 bg-lic-teal text-white hover:bg-lic-teal/90 ' +
    'shadow-md hover:shadow-teal-glow focus-visible:ring-lic-teal',
  charcoal:
    'border border-lic-charcoal/10 bg-lic-charcoal text-white hover:bg-lic-charcoal/90 ' +
    'shadow-md focus-visible:ring-lic-charcoal',
  outline:
    'border-2 border-lic-teal bg-white text-lic-teal hover:bg-lic-mint ' +
    'focus-visible:ring-lic-teal',
  ghost:
    'border border-transparent text-lic-body hover:bg-lic-mint/80 hover:text-lic-charcoal ' +
    'focus-visible:ring-lic-teal/40',
  link:
    'border border-transparent text-lic-teal underline-offset-4 hover:underline ' +
    'focus-visible:ring-lic-teal/40',
};

const SIZES = {
  sm: 'rounded-full px-3 py-2 text-xs font-semibold min-h-[44px]',
  md: 'rounded-full px-5 py-2.5 text-sm font-semibold min-h-[48px]',
  lg: 'rounded-full px-7 py-3 text-sm font-semibold min-h-[52px]',
};

const Button = ({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  ...rest
}) => (
  <Component
    className={cn(
      'group inline-flex items-center justify-center gap-2 transition-all duration-200 ease-material',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
      'disabled:cursor-not-allowed disabled:opacity-45',
      fullWidth && 'w-full',
      VARIANTS[variant],
      SIZES[size],
      className,
    )}
    {...rest}
  >
    {leftIcon && <span className="-ml-0.5">{leftIcon}</span>}
    <span>{children}</span>
    {rightIcon && (
      <span className="-mr-0.5 transition-transform duration-200 ease-material group-hover:translate-x-0.5">
        {rightIcon}
      </span>
    )}
  </Component>
);

export default Button;
