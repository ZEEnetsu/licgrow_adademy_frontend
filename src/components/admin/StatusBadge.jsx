import Icon from "../ui/Icon.jsx";
import { BADGE_TONE, statusMeta } from "./status.js";
import { cx } from "./cx.js";

/**
 * The one status pill. Pass a `status` from STATUS_META ("published",
 * "pending"…) and it picks the label, tone and icon; override any of them for
 * a one-off. Colour is never the only signal — every badge has a word.
 */
export default function StatusBadge({ status, label, tone, icon, dot = true, size = "md", className }) {
  const meta = statusMeta(status);
  const resolvedTone = tone ?? meta.tone;
  const resolvedIcon = icon === undefined ? meta.icon : icon;

  return (
    <span
      className={cx(
        "caps inline-flex shrink-0 items-center gap-1.5 rounded-full font-bold whitespace-nowrap",
        size === "sm" ? "px-2 py-0.5 text-[9.5px]" : "px-2.5 py-1 text-[10.5px]",
        BADGE_TONE[resolvedTone] ?? BADGE_TONE.neutral,
        className,
      )}
    >
      {resolvedIcon ? (
        <Icon name={resolvedIcon} className="h-3 w-3" strokeWidth={2.25} />
      ) : dot ? (
        <span className="relative flex h-1.5 w-1.5" aria-hidden>
          {meta.pulse && (
            <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-60" />
          )}
          <span className="relative h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      ) : null}
      {label ?? meta.label}
    </span>
  );
}
