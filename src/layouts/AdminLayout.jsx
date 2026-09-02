/**
 * Admin shell.
 *
 * Previously a fixed `grid-cols-8 grid-rows-12`, which caused two problems:
 * the header's height was a fraction of the viewport (tiny on a laptop, huge
 * on a monitor), and the sidebar's width was locked to one of eight columns,
 * so it could never collapse.
 *
 * A flex row fixes both: the sidebar owns its own animated width, and the main
 * column takes whatever is left. `min-w-0` on the main column is what stops a
 * wide table or chart from pushing the sidebar off-screen — without it a flex
 * child refuses to shrink below its content.
 */
const AdminLayout = ({ children }) => (
  <div className="bg-bg h-screen flex overflow-hidden text-text-primary">
    {children}
  </div>
);

export default AdminLayout;
