import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import Icon from "../ui/Icon.jsx";
import { EXPO } from "../motion/primitives.js";
import { cx } from "./cx.js";

const EYEBROW_TONE = {
  mint: "bg-tint-mint text-success ring-success/15",
  lavender: "bg-tint-lavender text-accent ring-accent/15",
  // older name for lavender, kept so existing call sites still work
  peach: "bg-tint-lavender text-accent ring-accent/15",
  plain: "bg-surface-elevated text-text-muted ring-border",
};

/** The landing page's small caps chip with a dot, on theme tokens. */
export function Eyebrow({ children, tone = "mint", className }) {
  return (
    <span
      className={cx(
        "caps inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold ring-1 ring-inset",
        EYEBROW_TONE[tone],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {children}
    </span>
  );
}

/**
 * The top of every admin page — and the page's only <h1>.
 *
 *   back        { to, label } — a quiet link up a level, for detail pages
 *   eyebrow     a caps chip naming the section ("People")
 *   title       Plus Jakarta display type, like the landing headings
 *   meta        badges beside the title (status, counts)
 *   description one or two lines on what this page is for
 *   actions     the page's buttons; at most one `primary`
 */
export default function PageHeader({ back, eyebrow, eyebrowTone = "mint", title, meta, description, actions, className }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EXPO }}
      className={cx("flex flex-col gap-5 pt-1 lg:flex-row lg:items-end lg:justify-between", className)}
    >
      <div className="min-w-0">
        {back && (
          <Link
            to={back.to}
            className="group/back focus-ring mb-4 flex w-fit items-center gap-1.5 rounded-full text-[13px] font-semibold text-text-muted transition-colors duration-200 hover:text-text-primary"
          >
            <Icon
              name="arrowLeft"
              className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover/back:-translate-x-0.5"
              strokeWidth={2}
            />
            <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1.5px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-500 ease-out-expo group-hover/back:bg-[length:100%_1.5px]">
              {back.label}
            </span>
          </Link>
        )}
        {eyebrow && <Eyebrow tone={eyebrowTone}>{eyebrow}</Eyebrow>}
        <div className={cx("flex flex-wrap items-center gap-x-3 gap-y-2", eyebrow && "mt-3")}>
          <h1 className="h-display min-w-0 text-[clamp(1.75rem,2.6vw,2.5rem)] font-extrabold break-words text-text-primary">
            {title}
          </h1>
          {meta && <div className="flex flex-wrap items-center gap-2">{meta}</div>}
        </div>
        {description && <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">{actions}</div>}
    </motion.header>
  );
}
