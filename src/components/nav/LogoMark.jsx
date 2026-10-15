/*
 * The licgrow mark: three chevrons rising like a sprout. Same polygon as
 * public/brand-mark-orange.svg and public/brand-mark-blue.svg; here it fills
 * with currentColor, so callers colour it with a text-* class (ember on ink,
 * ink on light) and size it by height alone.
 */
const POINTS =
  '81.5,210.2 81.5,254.6 147.6,254.6 179.7,232.1 186.1,223.7 186.5,214.2 174.9,174.9 208.5,200.1 216.7,202.0 225.3,200.1 259.1,176.4 245.6,216.7 246.9,226.1 251.8,233.0 282.8,254.6 317.8,254.6 318.5,210.2 288.4,210.0 344.6,170.0 350.5,166.0 328.2,134.4 325.0,129.5 259.1,176.5 280.6,120.8 239.9,106.9 238.3,107.5 217.2,162.1 191.5,77.9 149.4,90.9 174.8,174.7 140.4,147.9 114.2,182.9 114.4,183.6 147.7,210.0';

export default function LogoMark({ className = '' }) {
  return (
    <svg
      viewBox="81 77 270 178"
      className={`block w-auto ${className}`}
      style={{ aspectRatio: '270 / 178' }}
      aria-hidden
    >
      <polygon points={POINTS} fill="currentColor" />
    </svg>
  );
}
