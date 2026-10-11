import { EXPO, M } from './primitives.js';

/**
 * Fade-and-rise on first entry. Transform and opacity only, so it stays on
 * the compositor; MotionConfig's reducedMotion="user" drops the rise.
 *
 * `amount` is kept low on purpose: a block taller than the viewport can never
 * be 30% visible, and would then never reveal at all.
 */
export default function Reveal({
  as = 'div',
  children,
  className = '',
  delay = 0,
  y = 28,
  x = 0,
  amount = 0.15,
  ...rest
}) {
  const Comp = M[as] ?? M.div;
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, amount, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.95, ease: EXPO, delay }}
      {...rest}
    >
      {children}
    </Comp>
  );
}
