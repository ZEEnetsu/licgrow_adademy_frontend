import { cn } from './cn.js';

const SectionHeading = ({
  label,
  title,
  subtitle,
  align = 'left',
  className = '',
}) => {
  const alignment = align === 'center' ? 'mx-auto text-center' : 'text-left';

  return (
    <div className={cn('max-w-3xl space-y-3', alignment, className)}>
      {label && (
        <span className="inline-block text-[11px] font-bold uppercase tracking-[0.22em] text-lic-teal">
          {label}
        </span>
      )}
      {title && (
        <h2
          className={cn(
            'text-balance font-semibold tracking-tight text-lic-charcoal',
            'text-[clamp(1.5rem,2.5vw+0.5rem,2.25rem)] leading-tight',
          )}
        >
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="text-balance text-base leading-relaxed text-lic-body">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeading;
