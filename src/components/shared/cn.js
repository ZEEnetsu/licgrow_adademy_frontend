/**
 * cn — minimal className joiner.
 * Filters falsy values so callers can pass conditional class strings cheaply
 * without pulling in `clsx` or `classnames` as a dependency.
 *
 *   cn('btn', isActive && 'btn-active', undefined, null, 'mt-2')
 *   // → 'btn btn-active mt-2'
 */
export const cn = (...parts) => parts.filter(Boolean).join(' ');
