/**
 * The scrolling main column.
 *
 * `flex-1 min-h-0` is the important pair: min-h-0 lets a flex child shrink
 * below its content so `overflow-y-auto` actually engages. Without it the
 * column grows to fit and the page scrolls as a whole, which is what pushed
 * the header off screen and left charts clipped at the bottom.
 */
const DashboardLayout = ({ children }) => (
  <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-bg">
    {children}
  </main>
);

export default DashboardLayout;
