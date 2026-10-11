import SmoothScrolling from "./hooks/SmoothScrolling.jsx";
import Home from "./pages/home/Home.jsx";

/**
 * The landing page.
 *
 * A purpose-built scrolling story (pages/home/) that curates the reference's
 * home, why-lic, startup, explore and faq sections. The long-form versions of
 * those sections live on their own routes — /why-lic, /be-your-own-boss,
 * /explore-india — declared in pages/site/sections.js.
 */
const App = () => (
  <SmoothScrolling>
    <Home />
  </SmoothScrolling>
);

export default App;
