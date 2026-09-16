import { ReactLenis } from 'lenis/react';
import 'lenis/dist/lenis.css'; 
function SmoothScrolling({ children }) {
  const lenisOptions = {
    // THE MAGIC NUMBER: Controls the "heaviness" of the scroll.
    // 0.08 is the perfect sweet spot for most portfolios.
    // 0.1 is standard. 0.05 is the heavy, luxurious Apple feel. 
  lerp: 0.08, 

  // Multipliers
  wheelMultiplier: 1, // Keep this at 1 unless you want the user to scroll faster
  touchMultiplier: 2, // Makes touch screens feel a bit more responsive

  // Device handling
  smoothWheel: true, // Smooths out standard clicky mouse wheels
  syncTouch: false, // Leave false! Forcing smooth scroll on mobile touch feels terrible.
  
  // Optional but recommended for fixed elements
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  };

  return (
    <ReactLenis root options={lenisOptions}>
      {children}
    </ReactLenis>
  )
}

export default SmoothScrolling;