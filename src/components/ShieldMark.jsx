export default function ShieldMark({ className = '' }) {
  return (
    <span
      className={[
        'inline-grid h-9 w-9 place-items-center rounded-card bg-gradient-to-br from-lic-navy to-lic-royal text-white shadow-soft',
        className,
      ].join(' ')}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1.06 13.54l-3.3-3.3 1.41-1.41 1.89 1.89 4.78-4.78 1.41 1.41-6.19 6.19z" />
      </svg>
    </span>
  );
}