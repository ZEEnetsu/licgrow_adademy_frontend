/** Dark-layered shadows only — no colored glow */
export const shadow = {
  card: 'shadow-[0_2px_8px_rgba(0,0,0,0.4),0_1px_2px_rgba(0,0,0,0.6)]',
  cardHover:
    'hover:shadow-[0_8px_24px_rgba(0,0,0,0.5),0_2px_8px_rgba(0,0,0,0.7)]',
  cardInset:
    'shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_2px_8px_rgba(0,0,0,0.4),0_1px_2px_rgba(0,0,0,0.6)]',
  cardInsetHover:
    'hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_8px_24px_rgba(0,0,0,0.5),0_2px_8px_rgba(0,0,0,0.7)]',
  sidebar: 'shadow-[4px_0_24px_rgba(0,0,0,0.6)]',
  drawer: 'shadow-[-8px_0_40px_rgba(0,0,0,0.7),-2px_0_8px_rgba(0,0,0,0.5)]',
  tooltip: 'shadow-[0_8px_24px_rgba(0,0,0,0.55),0_2px_8px_rgba(0,0,0,0.65)]',
};

export const EASE = [0.4, 0, 0.2, 1];

export const transitionHover = 'transition-[box-shadow,background-color,border-color,color] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]';
