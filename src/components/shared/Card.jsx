import { cn } from './cn.js';

const VARIANTS = {
  surface:
    'rounded-card-lg border border-black/[0.06] bg-white shadow-soft',
  flat: 'rounded-card-lg border border-black/[0.06] bg-lic-offwhite',
  glass: 'rounded-card-lg border border-lic-teal/20 bg-white/80 shadow-soft backdrop-blur-md',
  dark: 'rounded-card-lg border border-slate-700/50 bg-slate-900 text-slate-100 shadow-xl',
};

const PADDINGS = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const normalizeVariant = (v) => (v === 'light' ? 'surface' : v);

const Card = ({
  as: Component = 'div',
  variant = 'surface',
  padding = 'md',
  interactive = false,
  className = '',
  children,
  ...rest
}) => (
  <Component
    className={cn(
      'transition-all duration-[250ms] ease-material',
      VARIANTS[normalizeVariant(variant)],
      PADDINGS[padding],
      interactive &&
        'cursor-pointer hover:-translate-y-1.5 hover:shadow-teal-glow',
      className,
    )}
    {...rest}
  >
    {children}
  </Component>
);

export default Card;
