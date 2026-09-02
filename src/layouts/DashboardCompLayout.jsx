/**
 * One section of a dashboard page.
 *
 * Sections stack vertically and share a single rhythm: equal horizontal
 * padding, equal vertical padding, one hairline between neighbours. The
 * divider previously used a hardcoded `zinc-800`, which was invisible in light
 * mode; it is a token now, and the last section drops it so the page does not
 * end on a stray rule.
 */
const DashboardCompLayout = ({ children, className = "" }) => (
  <section className={`px-6 py-5 border-b border-border last:border-b-0 ${className}`}>
    {children}
  </section>
);

export default DashboardCompLayout;
