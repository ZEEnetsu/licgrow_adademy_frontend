import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const isDashboard = (pathname) => pathname.startsWith('/dashboard');

const ThemeTransitionOverlay = () => {
  const location = useLocation();
  const previousPath = useRef(location.pathname);
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState('idle');

  useEffect(() => {
    const wasDash = isDashboard(previousPath.current);
    const willDash = isDashboard(location.pathname);

    if (wasDash !== willDash) {
      setVisible(true);
      setPhase('in');

      const fadeOut = setTimeout(() => setPhase('out'), 250);
      const unmount = setTimeout(() => {
        setVisible(false);
        setPhase('idle');
      }, 500);

      previousPath.current = location.pathname;

      return () => {
        clearTimeout(fadeOut);
        clearTimeout(unmount);
      };
    }

    previousPath.current = location.pathname;
    return undefined;
  }, [location.pathname]);

  if (!visible) return null;

  const toDash = isDashboard(location.pathname);

  return (
    <div
      aria-hidden="true"
      className={[
        'fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-200 ease-material',
        toDash ? 'bg-lic-offwhite' : 'bg-white',
        phase === 'out' ? 'opacity-0' : 'opacity-100',
      ].join(' ')}
    >
      <div className="flex items-center gap-3">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-lic-teal" />
        <span
          className={[
            'text-sm font-medium',
            toDash ? 'text-lic-body' : 'text-lic-body',
          ].join(' ')}
        >
          {toDash ? 'Opening your dashboard…' : 'One moment…'}
        </span>
      </div>
    </div>
  );
};

export default ThemeTransitionOverlay;
