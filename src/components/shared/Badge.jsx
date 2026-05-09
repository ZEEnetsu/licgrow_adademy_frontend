import { cn } from './cn.js';

const TONES = {
  neutral:
    'border-black/[0.08] bg-white text-lic-body',
  ink:
    'border-lic-charcoal/15 bg-lic-charcoal text-white',
  indigo:
    'border-lic-teal/35 bg-lic-mint text-lic-charcoal',
  frost:
    'border-black/[0.06] bg-lic-offwhite text-lic-charcoal',
  success:
    'border-lic-teal/40 bg-lic-teal/10 text-lic-teal',
};

const Badge = ({
  tone = 'neutral',
  dot = false,
  className = '',
  children,
  ...rest
}) => (
  <span
    className={cn(
      'inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-tight',
      TONES[tone],
      className,
    )}
    {...rest}
  >
    {dot && (
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          tone === 'indigo' ? 'bg-lic-teal' : 'bg-lic-body/50',
        )}
      />
    )}
    {children}
  </span>
);

export default Badge;
