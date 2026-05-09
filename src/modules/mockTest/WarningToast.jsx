import { useEffect, useRef } from 'react';

/** Top-center amber warning toast. */
export default function WarningToast({ message, visible, onDismiss }) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (!visible) return undefined;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      onDismiss();
    }, 4000);
    return () => window.clearTimeout(timerRef.current ?? 0);
  }, [visible, onDismiss, message]);

  if (!visible || !message) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-6 z-[90] flex justify-center px-4">
      <div className="motion-safe:animate-[toastIn_0.3s_ease-out]" style={{ maxWidth: 520 }}>
        <style>{`
          @keyframes toastIn {
            from { opacity: 0; transform: translateY(-100%); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        <div className="pointer-events-none flex gap-3 rounded-[12px] border border-[rgba(245,158,11,0.3)] border-l-[3px] border-l-amber-400 bg-[#1C2A3E] px-4 py-3 shadow-[0_12px_32px_rgba(0,0,0,0.45)]">
          <span aria-hidden className="text-xl">
            ⚠️
          </span>
          <p className="text-[0.875rem] leading-relaxed text-[#CBD5E1]">{message}</p>
        </div>
      </div>
    </div>
  );
}
