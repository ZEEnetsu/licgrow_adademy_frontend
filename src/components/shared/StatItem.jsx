import { cn } from './cn.js';

const StatItem = ({ value, label, sub, className = '' }) => (
  <div className={cn('space-y-1', className)}>
    <p
      className="font-bold tracking-tight text-lic-charcoal"
      style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}
    >
      {value}
    </p>
    <p className="text-sm text-lic-body">{label}</p>
    {sub && <p className="text-[11px] text-lic-body/75">{sub}</p>}
  </div>
);

export default StatItem;
