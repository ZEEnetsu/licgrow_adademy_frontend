import { MotionConfig } from "framer-motion";

import { ConfirmProvider, ToastProvider } from "../components/admin";

/**
 * Admin shell frame.
 *
 * An inset layout, like the sign-in page: the canvas fills the window and the
 * ink rail and content column sit inside it with an 8–12px gutter, so the
 * rail reads as a panel rather than a strip glued to the edge.
 *
 * It also owns the admin's app-wide services:
 *   · MotionConfig reducedMotion="user" — every framer animation inside drops
 *     its transforms when the OS asks for less motion
 *   · ToastProvider / ConfirmProvider — `useToast()` and `useConfirm()`
 *
 * `h-dvh` and `overflow-hidden` keep the window itself from scrolling; only
 * `#admin-main` scrolls. `min-w-0` on the content column (in Admin.jsx) is
 * what stops a wide table pushing the rail off screen.
 */
const AdminLayout = ({ children }) => (
  <MotionConfig reducedMotion="user">
    <ToastProvider>
      <ConfirmProvider>
        <div className="flex h-dvh gap-2 overflow-hidden bg-bg p-2 text-text-primary sm:gap-3 sm:p-3">
          <a
            href="#admin-main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[90] focus:rounded-full focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-brand-contrast"
          >
            Skip to content
          </a>
          {children}
        </div>
      </ConfirmProvider>
    </ToastProvider>
  </MotionConfig>
);

export default AdminLayout;
