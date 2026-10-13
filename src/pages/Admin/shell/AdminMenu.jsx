import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";

import Icon from "../../../components/ui/Icon.jsx";
import { useMedia } from "../../../components/motion/primitives.js";
import { IconButton, ThemeToggle, Tooltip, cx } from "../../../components/admin";
import { selectCan, selectIsSuperAdmin } from "../../../app/features/auth/auth.selectors.js";
import { PERMISSIONS } from "../../../app/features/auth/permissions.js";
import { useGetEnrollmentsQuery } from "../../../app/apis/enrollment.api.js";
import { PENDING_POLL_MS, PENDING_PREVIEW } from "../queries.js";
import AdminBrand from "./AdminBrand.jsx";
import { visibleSections } from "./nav.js";

const PILL_SPRING = { type: "spring", stiffness: 380, damping: 32 };

/**
 * The ink rail.
 *
 * The landing page's dark band (`mesh-navy-deep` + grain + an ember pool),
 * inset from the window edge with the login panel's 28px corners. It stays
 * ink in both themes — the one constant brand surface in the admin.
 *
 *   desktop  256px, collapsing to a 76px icon rail (width animates on the
 *            landing page's expo curve; labels become tooltips)
 *   mobile   the same panel as a drawer over the content, with a scrim
 *
 * The active item is one frosted `layoutId` pill with a mint bar, springing
 * between items the way the landing page's tabs do. Orange stays only in the
 * pending count and the background pool. Items the admin can't use are not
 * shown.
 */
export default function AdminMenu({ collapsed, mobileOpen, onToggle, onCloseMobile }) {
  const isDesktop = useMedia("(min-width: 768px)");
  const compact = collapsed && isDesktop;

  const can = useSelector(selectCan);
  const isSuperAdmin = useSelector(selectIsSuperAdmin);
  const sections = visibleSections(can, isSuperAdmin);

  const canReview = can(PERMISSIONS.ENROLLMENT_REVIEW);
  const { data: pending } = useGetEnrollmentsQuery(PENDING_PREVIEW, {
    skip: !canReview,
    pollingInterval: PENDING_POLL_MS,
  });
  const badges = { pending: pending?.meta?.total ?? 0 };

  return (
    <>
      <AnimatePresence>
        {mobileOpen && !isDesktop && (
          <motion.div
            key="scrim"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onCloseMobile}
            className="fixed inset-0 z-30 bg-overlay backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        aria-label="Admin navigation"
        className={cx(
          "mesh-navy-deep relative isolate z-40 flex shrink-0 flex-col overflow-hidden rounded-[28px] text-brand-contrast dark:ring-1 dark:ring-white/[0.08]",
          "transition-[width,translate] duration-500 ease-out-expo",
          "max-md:fixed max-md:inset-y-2 max-md:left-2 max-md:w-[min(288px,calc(100vw-1rem))] max-md:shadow-pop",
          mobileOpen ? "max-md:translate-x-0" : "max-md:-translate-x-[calc(100%+1rem)]",
          compact ? "md:w-[76px]" : "md:w-64",
        )}
      >
        <span className="grain-overlay" aria-hidden />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(250,79,12,0.32),transparent_65%)]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(174,213,209,0.12),transparent_65%)]"
        />

        <div className={cx("relative flex h-[4.75rem] shrink-0 items-center", compact ? "justify-center px-2" : "px-5")}>
          <AdminBrand collapsed={compact} />
          {!isDesktop && (
            <IconButton icon="x" label="Close menu" tone="onBrand" onClick={onCloseMobile} tooltip={false} className="ml-auto" />
          )}
        </div>

        <nav aria-label="Admin sections" className="scroll-panel relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 pb-4">
          <LayoutGroup id="admin-nav">
            {sections.map((section) => (
              <div key={section.id} className="mt-5 first:mt-2">
                {compact ? (
                  <span className="mx-auto mb-2 block h-px w-6 bg-white/15" aria-hidden />
                ) : (
                  <p className="caps mb-2 px-3.5 text-[10px] font-bold text-brand-contrast/55">{section.label}</p>
                )}
                <ul className="flex flex-col gap-0.5">
                  {section.items.map((item) => (
                    <li key={item.id}>
                      <RailItem item={item} compact={compact} badge={item.badge ? badges[item.badge] : 0} onNavigate={onCloseMobile} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </LayoutGroup>
        </nav>

        <div
          className={cx(
            "relative flex shrink-0 items-center gap-2 border-t border-white/10 p-3",
            compact ? "flex-col" : "justify-between",
          )}
        >
          {compact ? <ThemeToggle variant="icon" onBrand /> : <ThemeToggle onBrand />}
          {isDesktop && (
            <IconButton
              icon="sidebar"
              label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              tone="onBrand"
              tooltipSide={compact ? "right" : "top"}
              onClick={onToggle}
              aria-expanded={!collapsed}
            />
          )}
        </div>
      </aside>
    </>
  );
}

function RailItem({ item, compact, badge, onNavigate }) {
  return (
    <Tooltip content={badge ? `${item.label} · ${badge} pending` : item.label} side="right" disabled={!compact} className="flex w-full">
      <NavLink
        to={item.to}
        onClick={onNavigate}
        aria-label={compact ? item.label : undefined}
        className={({ isActive }) =>
          cx(
            "relative flex h-11 w-full items-center gap-3 rounded-full text-[14px] font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-mint",
            compact ? "justify-center px-0" : "px-3.5",
            isActive ? "text-white" : "text-brand-contrast/70 hover:bg-white/[0.06] hover:text-brand-contrast",
          )
        }
      >
        {({ isActive }) => (
          <>
            {isActive && (
              <motion.span
                layoutId="pill"
                transition={PILL_SPRING}
                className="absolute inset-0 rounded-full bg-white/10 ring-1 ring-white/10 ring-inset"
                aria-hidden
              >
                <span className="absolute inset-y-3 left-1.5 w-[3px] rounded-full bg-mint shadow-[0_0_12px_rgba(174,213,209,0.55)]" />
              </motion.span>
            )}
            <Icon name={item.icon} className="relative h-[19px] w-[19px] shrink-0" strokeWidth={isActive ? 2 : 1.75} />
            {!compact && <span className="relative min-w-0 truncate">{item.label}</span>}
            {badge > 0 &&
              (compact ? (
                <span className="absolute top-2 right-3 h-2 w-2 animate-pulse-soft rounded-full bg-ember ring-2 ring-ink" aria-hidden />
              ) : (
                <span className="relative ml-auto rounded-full bg-peach px-2 py-0.5 text-[11px] font-bold text-ink tabular-nums">
                  <span className="sr-only">, </span>
                  {badge > 99 ? "99+" : badge}
                  <span className="sr-only"> pending</span>
                </span>
              ))}
          </>
        )}
      </NavLink>
    </Tooltip>
  );
}
