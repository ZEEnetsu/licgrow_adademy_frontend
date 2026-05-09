import { cn } from './cn.js';

/**
 * Container — max-width wrapper with horizontal padding.
 * `size` controls the breakpoint cap.
 */
const SIZES = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
};

const Container = ({
  as: Component = 'div',
  size = 'lg',
  className = '',
  children,
  ...rest
}) => (
  <Component
    className={cn('mx-auto w-full px-6 sm:px-8', SIZES[size], className)}
    {...rest}
  >
    {children}
  </Component>
);

export default Container;
