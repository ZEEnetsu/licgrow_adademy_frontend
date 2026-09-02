import { Card, SectionTitle } from "./Surface.jsx";
import { FIGURE_TONE } from "./tokens.js";

/**
 * Composite presenters — the two shapes the dashboards kept re-typing by hand.
 *
 * Everything here is pure: props in, markup out. No hooks, no store, no API
 * imports. That is what lets a page's data layer be tested without a DOM and
 * its UI layer be rendered from a literal object.
 */

/**
 * A titled panel: heading, then an elevated card.
 *
 * `flex flex-col` on the section with `flex-1` on the card is what makes two
 * panels sharing a grid row end at the same height — otherwise the shorter one
 * floats and the row looks broken.
 */
export const Panel = ({ title, action, className = "", children }) => (
  <section className="flex flex-col">
    <SectionTitle action={action}>{title}</SectionTitle>
    <Card className={`flex-1 p-5 ${className}`}>{children}</Card>
  </section>
);

/**
 * A stack of label/figure rows.
 *
 * Rows space themselves — the caller passes data, not margins, so a panel with
 * three figures cannot accidentally get different spacing from one with two.
 * `children` is the footer slot: a link, a button, whatever the panel needs
 * under its numbers.
 */
export const FigureList = ({ figures, note, children }) => (
  <>
    {figures.map(({ label, value, tone = "default" }, index) => (
      <div
        key={label}
        className={`flex items-baseline justify-between gap-3 ${index > 0 ? "mt-3" : ""}`}
      >
        <span className="text-sm text-text-muted">{label}</span>
        <span className={`text-2xl font-semibold ${FIGURE_TONE[tone]}`}>
          {value}
        </span>
      </div>
    ))}
    {note && <p className="text-[11px] text-text-muted mt-3">{note}</p>}
    {children}
  </>
);
