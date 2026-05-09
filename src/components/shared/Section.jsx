import Container from './Container.jsx';
import { cn } from './cn.js';

const TONES = {
  transparent: 'bg-transparent',
  muted:       'bg-slate-900/40 border-y border-slate-800/80',
  deep:        'bg-slate-950',
};

const PADDINGS = {
  sm: 'py-12 sm:py-16',
  md: 'py-16 sm:py-20',
  lg: 'py-20 sm:py-28',
};

/** Lightweight section wrapper for non-marketing pages. */
const Section = ({
  id,
  tone = 'transparent',
  padding = 'md',
  containerSize = 'lg',
  className = '',
  innerClassName = '',
  children,
}) => (
  <section
    id={id}
    className={cn('relative isolate text-slate-100', TONES[tone], PADDINGS[padding], className)}
  >
    <Container size={containerSize} className={innerClassName}>
      {children}
    </Container>
  </section>
);

export default Section;
