import { Link } from 'react-router-dom';
import { cn } from './cn.js';

const BrandMark = ({
  to = '/',
  size = 'md',
  className = '',
}) => {
  const sizes = {
    sm: { box: 'h-7 w-7 text-[10px]', text: 'text-sm' },
    md: { box: 'h-8 w-8 text-xs', text: 'text-base' },
    lg: { box: 'h-10 w-10 text-sm', text: 'text-lg' },
  };
  const d = sizes[size];

  return (
    <Link
      to={to}
      className={cn('group inline-flex items-center gap-2.5', className)}
      aria-label="LICPro Academy home"
    >
      <span
        className={cn(
          'grid place-items-center rounded-card bg-gradient-to-br from-lic-teal to-lic-sky font-bold text-white shadow-soft',
          'transition-transform duration-200 ease-material group-hover:scale-[1.03]',
          d.box,
        )}
      >
        L
      </span>
      <span className={cn('font-semibold tracking-tight text-lic-charcoal', d.text)}>
        LICPro <span className="text-lic-teal">Academy</span>
      </span>
    </Link>
  );
};

export default BrandMark;
