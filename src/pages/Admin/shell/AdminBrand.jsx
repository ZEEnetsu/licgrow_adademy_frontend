import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { cx } from "../../../components/admin/cx.js";
import { EXPO } from "../../../components/motion/primitives.js";

const MotionLink = motion.create(Link);

/* the mark springs in on mount, lifts on hover and dips on press */
const MARK = {
  hidden: { scale: 0.6, opacity: 0 },
  rest: { scale: 1, opacity: 1, transition: { duration: 0.5, ease: EXPO } },
  hover: { scale: 1.06, transition: { type: "spring", stiffness: 400, damping: 22 } },
  tap: { scale: 0.96 },
};

/**
 * The rail's logo: the licgrow shield in the app's cool palette (an ink shield
 * on a lavender disc, ringed in mint) and the wordmark. The landing page's
 * BrandMark keeps its ember badge; the app portals stay cool, so the rail
 * draws its own mark rather than recolouring that one.
 */
export default function AdminBrand({ collapsed = false }) {
  return (
    <MotionLink
      to="/admin/overview"
      initial="hidden"
      animate="rest"
      whileHover="hover"
      whileTap="tap"
      aria-label="licgrow admin — go to dashboard"
      className="flex min-w-0 items-center gap-3 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mint"
    >
      <motion.span
        variants={MARK}
        aria-hidden
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-linear-to-br from-lavender to-lavender-deep text-ink shadow-soft ring-2 ring-mint/40"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <path d="M12 2 4 5v7c0 6 8 10 8 10s8-4 8-10V5l-8-3z" fill="currentColor" />
          <path d="m9 12 2 2 4-4" fill="none" className="stroke-lavender" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.span>
      <span className={cx("min-w-0 transition-opacity duration-200", collapsed && "sr-only")}>
        <span className="block truncate font-display text-[17px] leading-tight font-extrabold tracking-tight text-cream">
          lic<span className="text-mint">grow</span>
        </span>
        <span className="caps mt-1 inline-flex rounded-full bg-white/[0.08] px-2 py-0.5 text-[9.5px] font-bold text-mint">
          Admin console
        </span>
      </span>
    </MotionLink>
  );
}
