import { cn } from './cn.js';

const Star = ({ filled }) => (
  <svg
    viewBox="0 0 20 20"
    aria-hidden="true"
    className={cn('h-4 w-4', filled ? 'text-lic-teal' : 'text-lic-mint')}
  >
    <path
      fill="currentColor"
      d="M10 1.5l2.6 5.27 5.81.84-4.2 4.1.99 5.79L10 14.77l-5.2 2.73.99-5.79-4.2-4.1 5.81-.84L10 1.5z"
    />
  </svg>
);

const StarRating = ({ value = 5, className = '' }) => (
  <div
    className={cn('flex items-center gap-0.5', className)}
    role="img"
    aria-label={`Rated ${value} out of 5`}
  >
    {Array.from({ length: 5 }, (_, i) => (
      <Star key={i} filled={i < value} />
    ))}
  </div>
);

export default StarRating;
